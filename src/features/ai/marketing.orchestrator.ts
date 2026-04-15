import Anthropic from "@anthropic-ai/sdk";
import {
  ContentPiece,
  MarketingCampaignRequest,
  MarketingCampaignResponse,
  ResearchPayload,
  WriteContentPayload,
} from "./marketing.types";

// ─── Shared cached system prompt ──────────────────────────────────────────────
const SYSTEM = `You are the CMO of Joie — a world-class Indian D2C marketing strategist. You lead a lean AI marketing team of two specialists:
• Researcher: digs into audience, competitors, and trends
• Writer: crafts channel-specific copy that converts

Orchestrate them via tools. Always think before calling a tool. Return only valid JSON when asked.`;

// ─── Tool definitions (3 tools, minimum) ──────────────────────────────────────
const TOOLS: Anthropic.Tool[] = [
  {
    name: "research_topic",
    description:
      "Delegates to the Researcher agent. Returns insights on audience, competitors, trends, or keywords for the campaign.",
    input_schema: {
      type: "object" as const,
      properties: {
        topic: { type: "string", description: "What to research" },
        focus: {
          type: "string",
          enum: ["audience", "competitors", "trends", "keywords"],
        },
      },
      required: ["topic", "focus"],
    },
  },
  {
    name: "write_content",
    description:
      "Delegates to the Writer agent. Produces a complete content piece for one channel.",
    input_schema: {
      type: "object" as const,
      properties: {
        channel: { type: "string", description: "e.g. Instagram, Email, Google Ads" },
        angle: { type: "string", description: "Campaign angle / hook" },
        researchSummary: { type: "string", description: "Key insights to ground the copy" },
        tone: { type: "string", description: "e.g. playful, aspirational, urgent" },
      },
      required: ["channel", "angle", "researchSummary", "tone"],
    },
  },
  {
    name: "compile_campaign",
    description:
      "Assembles all research and content into the final campaign JSON. Call this last.",
    input_schema: {
      type: "object" as const,
      properties: {
        strategyBrief: { type: "string" },
        targetAudience: { type: "string" },
        keyMessage: { type: "string" },
        researchInsights: { type: "string" },
        contentPieces: {
          type: "array",
          items: {
            type: "object",
            properties: {
              channel: { type: "string" },
              headline: { type: "string" },
              body: { type: "string" },
              cta: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
            },
            required: ["channel", "headline", "body", "cta"],
          },
        },
        kpis: { type: "array", items: { type: "string" } },
        budgetBreakdown: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: { type: "string" },
              percentage: { type: "number" },
            },
          },
        },
      },
      required: ["strategyBrief", "targetAudience", "keyMessage", "researchInsights", "contentPieces", "kpis", "budgetBreakdown"],
    },
  },
];

// ─── Researcher sub-agent ─────────────────────────────────────────────────────
async function runResearcher(
  client: Anthropic,
  payload: ResearchPayload
): Promise<string> {
  const res = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // fast + cheap for research
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: "You are a sharp market researcher for Indian D2C brands. Return a concise, bullet-point insight summary. No fluff.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Research focus: ${payload.focus}\nTopic: ${payload.topic}\n\nReturn 5 sharp bullet-point insights.`,
      },
    ],
  });
  return (res.content[0] as Anthropic.TextBlock).text;
}

// ─── Writer sub-agent ─────────────────────────────────────────────────────────
async function runWriter(
  client: Anthropic,
  payload: WriteContentPayload
): Promise<ContentPiece> {
  const res = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // fast + cheap for writing
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: "You are a high-converting copywriter for Indian D2C brands. Return ONLY valid JSON — no markdown, no prose.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Channel: ${payload.channel}
Angle: ${payload.angle}
Tone: ${payload.tone}
Research insights:
${payload.researchSummary}

Return JSON: { "channel": string, "headline": string, "body": string, "cta": string, "hashtags": string[] }`,
      },
    ],
  });
  return JSON.parse((res.content[0] as Anthropic.TextBlock).text) as ContentPiece;
}

// ─── Tool dispatcher ──────────────────────────────────────────────────────────
async function dispatchTool(
  client: Anthropic,
  name: string,
  input: Record<string, unknown>
): Promise<{ result: unknown; isDone: boolean; campaign?: MarketingCampaignResponse }> {
  if (name === "research_topic") {
    const insights = await runResearcher(client, input as unknown as ResearchPayload);
    return { result: insights, isDone: false };
  }

  if (name === "write_content") {
    const piece = await runWriter(client, input as unknown as WriteContentPayload);
    return { result: piece, isDone: false };
  }

  if (name === "compile_campaign") {
    const campaign: MarketingCampaignResponse = {
      strategyBrief: input.strategyBrief as string,
      targetAudience: input.targetAudience as string,
      keyMessage: input.keyMessage as string,
      researchInsights: input.researchInsights as string,
      content: input.contentPieces as ContentPiece[],
      kpis: input.kpis as string[],
      budget: { breakdown: input.budgetBreakdown as { item: string; percentage: number }[] },
    };
    return { result: "Campaign compiled.", isDone: true, campaign };
  }

  return { result: "Unknown tool.", isDone: false };
}

// ─── CMO Orchestrator (agentic loop) ─────────────────────────────────────────
export async function runMarketingTeam(
  req: MarketingCampaignRequest
): Promise<MarketingCampaignResponse> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userPrompt = `Campaign brief: ${req.brief}
Channels needed: ${req.channels.join(", ")}
Budget level: ${req.budget ?? "mid"}

Use your tools to: research the market, write content for each channel, then compile_campaign. Start now.`;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];

  let finalCampaign: MarketingCampaignResponse | undefined;

  // Agentic loop — max 10 turns to stay bounded
  for (let turn = 0; turn < 10; turn++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: TOOLS,
      messages,
    });

    // Append assistant response to history
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") break;

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        const { result, isDone, campaign } = await dispatchTool(
          client,
          block.name,
          block.input as Record<string, unknown>
        );

        if (isDone && campaign) {
          finalCampaign = campaign;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: typeof result === "string" ? result : JSON.stringify(result),
        });
      }

      messages.push({ role: "user", content: toolResults });

      if (finalCampaign) break;
    }
  }

  if (!finalCampaign) {
    throw new Error("Marketing team failed to compile campaign");
  }

  return finalCampaign;
}
