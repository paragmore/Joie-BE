import Anthropic from "@anthropic-ai/sdk";
import {
  CommerceChatRequest,
  ProductDescribeRequest,
  ProductDescribeResponse,
  StoreAuditRequest,
  StoreAuditResponse,
  StoreGenesisRequest,
  StoreGenesisResponse,
} from "./ai.types";

// System prompt cached at the Anthropic infrastructure level to avoid
// re-tokenising on every request (prompt caching saves cost + latency).
const COMMERCE_BRAIN_SYSTEM = `You are Joie's AI Commerce Brain — a world-class virtual Chief Commerce Officer specialising in Indian D2C e-commerce. You help small and medium business owners launch, grow, and optimise their online stores.

Your tone is warm, practical, and data-informed. You speak like a seasoned mentor who has built dozens of successful stores. You always output valid JSON when asked to, with no markdown fences or prose around it.`;

export class AiService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // ── 1. Store Genesis ────────────────────────────────────────────────────────
  async generateStoreGenesis(
    req: StoreGenesisRequest
  ): Promise<StoreGenesisResponse> {
    const prompt = `A business owner has described their idea in one paragraph. Your task is to generate a comprehensive store strategy for them.

Business description:
"${req.businessDescription}"
${req.region ? `Target region: ${req.region}` : "Target region: India"}

Return ONLY a valid JSON object matching this exact shape:
{
  "brandNames": [{ "name": string, "rationale": string }],   // 3 options
  "taglines": [string],                                        // 3 options
  "positioning": string,                                       // 2-3 sentences
  "targetPersona": {
    "age": string,
    "interests": [string],
    "painPoints": [string],
    "preferredChannels": [string]
  },
  "categories": [{ "name": string, "description": string }], // 4-6 categories
  "sampleProducts": [                                          // 3 products
    {
      "title": string,
      "shortDescription": string,
      "longDescription": string,
      "suggestedPrice": string,
      "tags": [string]
    }
  ],
  "brandVoice": string,
  "pricingTier": "budget" | "mid" | "premium" | "luxury"
}`;

    const response = await this.client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: COMMERCE_BRAIN_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as Anthropic.TextBlock).text.trim();
    return JSON.parse(text) as StoreGenesisResponse;
  }

  // ── 2. Product Describe ─────────────────────────────────────────────────────
  async generateProductDescription(
    req: ProductDescribeRequest
  ): Promise<ProductDescribeResponse> {
    const prompt = `Generate a compelling, SEO-optimised product listing for an Indian e-commerce store.

Product name: ${req.productName}
Key details / features:
${req.keyDetails}
${req.category ? `Category: ${req.category}` : ""}

Return ONLY a valid JSON object:
{
  "seoTitle": string,           // max 60 chars, keyword-rich
  "shortDescription": string,   // 1-2 sentences, benefit-led
  "longDescription": string,    // 3-4 paragraphs, story-driven
  "keyBenefits": [string],      // 4-5 bullet points
  "targetAudience": string,     // 1 sentence
  "tags": [string],             // 8-10 searchable tags
  "suggestedPriceRange": string // e.g. "₹499 – ₹799"
}`;

    const response = await this.client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: COMMERCE_BRAIN_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as Anthropic.TextBlock).text.trim();
    return JSON.parse(text) as ProductDescribeResponse;
  }

  // ── 3. Store Audit ──────────────────────────────────────────────────────────
  async auditStore(req: StoreAuditRequest): Promise<StoreAuditResponse> {
    const prompt = `Perform a rigorous commerce audit for this store and give brutally honest, actionable feedback.

Store name: ${req.storeName}
Total products: ${req.productCount}
Product titles:
${req.productTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}
${req.ownerConcerns ? `Owner's concerns: ${req.ownerConcerns}` : ""}

Return ONLY a valid JSON object:
{
  "healthScore": number,                           // integer 1-10
  "strengths": [string],                           // 2-3 genuine positives
  "criticalImprovements": [                        // top 3 blockers
    { "issue": string, "action": string }
  ],
  "quickWins": [string],                           // 3 things doable this week
  "longTermStrategies": [string],                  // 3 strategic moves
  "summary": string                                // 2-3 sentence executive summary
}`;

    const response = await this.client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: COMMERCE_BRAIN_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as Anthropic.TextBlock).text.trim();
    return JSON.parse(text) as StoreAuditResponse;
  }

  // ── 4. Streaming Commerce Chat ──────────────────────────────────────────────
  async *streamCommerceChat(req: CommerceChatRequest): AsyncGenerator<string> {
    const messages: Anthropic.MessageParam[] = [
      // Inject store context as a primed assistant turn if provided
      ...(req.history || []).map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: req.message },
    ];

    const systemBlocks: Anthropic.TextBlockParam[] = [
      {
        type: "text",
        text: COMMERCE_BRAIN_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ];

    if (req.storeContext) {
      systemBlocks.push({
        type: "text",
        text: `Current store context:\n${req.storeContext}`,
        cache_control: { type: "ephemeral" },
      });
    }

    const stream = await this.client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: systemBlocks,
      messages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        yield chunk.delta.text;
      }
    }
  }
}
