// ─── Store Genesis ────────────────────────────────────────────────────────────
export interface StoreGenesisRequest {
  /** One-paragraph natural language description of the business */
  businessDescription: string;
  /** Optional: target country / region for localisation */
  region?: string;
}

export interface StoreGenesisResponse {
  brandNames: { name: string; rationale: string }[];
  taglines: string[];
  positioning: string;
  targetPersona: {
    age: string;
    interests: string[];
    painPoints: string[];
    preferredChannels: string[];
  };
  categories: { name: string; description: string }[];
  sampleProducts: {
    title: string;
    shortDescription: string;
    longDescription: string;
    suggestedPrice: string;
    tags: string[];
  }[];
  brandVoice: string;
  pricingTier: "budget" | "mid" | "premium" | "luxury";
}

// ─── Product Describe ─────────────────────────────────────────────────────────
export interface ProductDescribeRequest {
  /** Raw product name or working title */
  productName: string;
  /** Bullet-point features / materials / specs in plain text */
  keyDetails: string;
  /** Optional: category the product belongs to */
  category?: string;
}

export interface ProductDescribeResponse {
  seoTitle: string;
  shortDescription: string;
  longDescription: string;
  keyBenefits: string[];
  targetAudience: string;
  tags: string[];
  suggestedPriceRange: string;
}

// ─── Store Audit ──────────────────────────────────────────────────────────────
export interface StoreAuditRequest {
  storeName: string;
  productCount: number;
  /** Array of product titles to analyse coverage */
  productTitles: string[];
  /** Optional: comma-separated weak spots the owner already suspects */
  ownerConcerns?: string;
}

export interface StoreAuditResponse {
  healthScore: number;            // 1–10
  strengths: string[];
  criticalImprovements: { issue: string; action: string }[];
  quickWins: string[];
  longTermStrategies: string[];
  summary: string;
}

// ─── Streaming Chat ───────────────────────────────────────────────────────────
export interface CommerceChatRequest {
  message: string;
  /** Conversation history for multi-turn context */
  history?: { role: "user" | "assistant"; content: string }[];
  /** Optional store context to ground the assistant */
  storeContext?: string;
}
