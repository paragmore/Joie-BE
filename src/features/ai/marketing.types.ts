// ─── Input ────────────────────────────────────────────────────────────────────
export interface MarketingCampaignRequest {
  /** One paragraph: product, audience, goal */
  brief: string;
  /** e.g. "Instagram", "Email", "Google Ads" */
  channels: string[];
  /** Budget hint — "low" | "mid" | "high" */
  budget?: "low" | "mid" | "high";
}

// ─── Internal tool payloads ───────────────────────────────────────────────────
export interface ResearchPayload {
  topic: string;
  focus: "audience" | "competitors" | "trends" | "keywords";
}

export interface WriteContentPayload {
  channel: string;
  angle: string;
  researchSummary: string;
  tone: string;
}

// ─── Output ───────────────────────────────────────────────────────────────────
export interface ContentPiece {
  channel: string;
  headline: string;
  body: string;
  cta: string;
  hashtags?: string[];
}

export interface MarketingCampaignResponse {
  strategyBrief: string;
  targetAudience: string;
  keyMessage: string;
  researchInsights: string;
  content: ContentPiece[];
  kpis: string[];
  budget: { breakdown: { item: string; percentage: number }[] };
}
