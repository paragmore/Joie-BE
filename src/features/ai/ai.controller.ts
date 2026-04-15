import { FastifyReply, FastifyRequest } from "fastify";
import { ApiHelper, ApiHelperHandler, IReply } from "../../helpers/ApiHelper";
import { AiService } from "./ai.service";
import { runMarketingTeam } from "./marketing.orchestrator";
import {
  CommerceChatRequest,
  ProductDescribeRequest,
  StoreAuditRequest,
  StoreGenesisRequest,
} from "./ai.types";
import { MarketingCampaignRequest } from "./marketing.types";

export class AiController {
  private service: AiService;

  constructor() {
    this.service = new AiService();
  }

  // POST /ai/store/genesis
  storeGenesis: ApiHelperHandler<
    StoreGenesisRequest,
    {},
    {},
    {},
    IReply
  > = async (request, reply) => {
    const body = request.body;
    if (!body?.businessDescription?.trim()) {
      return ApiHelper.missingParameters(reply, "businessDescription is required");
    }
    try {
      const result = await this.service.generateStoreGenesis(body);
      ApiHelper.success(reply, result);
    } catch (error) {
      console.error("[AI] storeGenesis error:", error);
      ApiHelper.callFailed(reply, "AI generation failed, please try again", 500);
    }
  };

  // POST /ai/product/describe
  productDescribe: ApiHelperHandler<
    ProductDescribeRequest,
    {},
    {},
    {},
    IReply
  > = async (request, reply) => {
    const body = request.body;
    if (!body?.productName?.trim() || !body?.keyDetails?.trim()) {
      return ApiHelper.missingParameters(reply, "productName and keyDetails are required");
    }
    try {
      const result = await this.service.generateProductDescription(body);
      ApiHelper.success(reply, result);
    } catch (error) {
      console.error("[AI] productDescribe error:", error);
      ApiHelper.callFailed(reply, "AI generation failed, please try again", 500);
    }
  };

  // POST /ai/store/audit
  storeAudit: ApiHelperHandler<
    StoreAuditRequest,
    {},
    {},
    {},
    IReply
  > = async (request, reply) => {
    const body = request.body;
    if (!body?.storeName || !body?.productTitles?.length) {
      return ApiHelper.missingParameters(reply, "storeName and productTitles are required");
    }
    try {
      const result = await this.service.auditStore(body);
      ApiHelper.success(reply, result);
    } catch (error) {
      console.error("[AI] storeAudit error:", error);
      ApiHelper.callFailed(reply, "AI audit failed, please try again", 500);
    }
  };

  // POST /ai/marketing/campaign  — full AI marketing team agentic run
  marketingCampaign: ApiHelperHandler<
    MarketingCampaignRequest,
    {},
    {},
    {},
    IReply
  > = async (request, reply) => {
    const body = request.body;
    if (!body?.brief?.trim() || !body?.channels?.length) {
      return ApiHelper.missingParameters(reply, "brief and channels are required");
    }
    try {
      const result = await runMarketingTeam(body);
      ApiHelper.success(reply, result);
    } catch (error) {
      console.error("[AI] marketingCampaign error:", error);
      ApiHelper.callFailed(reply, "Marketing team failed, please try again", 500);
    }
  };

  // POST /ai/chat  — Server-Sent Events streaming
  commerceChat = async (
    request: FastifyRequest<{ Body: CommerceChatRequest }>,
    reply: FastifyReply
  ) => {
    const body = request.body;
    if (!body?.message?.trim()) {
      reply.status(400).send({ status: 400, message: "message is required", body: {} });
      return;
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    try {
      for await (const chunk of this.service.streamCommerceChat(body)) {
        reply.raw.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      reply.raw.write("data: [DONE]\n\n");
    } catch (error) {
      console.error("[AI] commerceChat error:", error);
      reply.raw.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    } finally {
      reply.raw.end();
    }
  };
}
