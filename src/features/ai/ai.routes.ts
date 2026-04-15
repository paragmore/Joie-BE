import { FastifyInstance } from "fastify";
import { ApiHelper } from "../../helpers/ApiHelper";
import { AiController } from "./ai.controller";
import {
  CommerceChatRequest,
  ProductDescribeRequest,
  StoreAuditRequest,
  StoreGenesisRequest,
} from "./ai.types";

export default async (app: FastifyInstance) => {
  const ai = new AiController();

  // ── Store Intelligence ─────────────────────────────────────────────────────
  // POST /ai/store/genesis  — turn a business description into a full store strategy
  ApiHelper.post<StoreGenesisRequest, {}, {}, {}>(
    app,
    "/store/genesis",
    ai.storeGenesis
  );

  // POST /ai/store/audit  — health-check & recommendations for an existing store
  ApiHelper.post<StoreAuditRequest, {}, {}, {}>(
    app,
    "/store/audit",
    ai.storeAudit
  );

  // ── Product Intelligence ───────────────────────────────────────────────────
  // POST /ai/product/describe  — generate SEO-rich listing from raw product notes
  ApiHelper.post<ProductDescribeRequest, {}, {}, {}>(
    app,
    "/product/describe",
    ai.productDescribe
  );

  // ── Conversational Commerce Assistant (SSE streaming) ─────────────────────
  // POST /ai/chat  — real-time streaming answers to any commerce question
  app.post<{ Body: CommerceChatRequest }>("/chat", {}, ai.commerceChat);
};
