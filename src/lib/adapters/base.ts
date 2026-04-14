import { AdRow, AdSummary, AdsResponse } from "@/types/ads";

export interface FetchInsightsOptions {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  accountIds?: string[]; // platform-specific account identifiers
}

export interface DataSourceAdapter {
  name: "meta" | "google" | "ga4";
  fetchInsights(opts: FetchInsightsOptions): Promise<AdRow[]>;
}

// Build summary from a list of rows (used by all adapters)
export function buildSummary(rows: AdRow[]): AdSummary {
  const len = rows.length || 1;

  const has = (key: keyof AdRow) => rows.some((r) => r[key] !== undefined);
  const sum = (key: keyof AdRow) =>
    rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
  const avg = (key: keyof AdRow) => sum(key) / len;

  return {
    total_spend: sum("spend"),
    total_clicks: sum("clicks"),
    total_impressions: sum("impressions"),
    total_conversions: sum("conversions"),
    avg_ctr: avg("ctr"),
    avg_cpm: avg("cpm"),
    avg_cpc: avg("cpc"),
    avg_roas: avg("roas"),

    // Analytics
    total_sessions: has("sessions") ? sum("sessions") : undefined,
    total_users: has("users") ? sum("users") : undefined,
    total_pageviews: has("pageviews") ? sum("pageviews") : undefined,
    avg_bounce_rate: has("bounce_rate") ? avg("bounce_rate") : undefined,

    // Meta
    total_messages: has("messages") ? sum("messages") : undefined,
    total_landing_page_views: has("landing_page_views") ? sum("landing_page_views") : undefined,
    total_checkouts: has("checkouts") ? sum("checkouts") : undefined,
    total_video_views: has("video_views") ? sum("video_views") : undefined,

    // Google
    total_phone_calls: has("phone_calls") ? sum("phone_calls") : undefined,
    total_interactions: has("interactions") ? sum("interactions") : undefined,
    avg_conversion_rate: has("conversion_rate") ? avg("conversion_rate") : undefined,
    avg_interaction_rate: has("interaction_rate") ? avg("interaction_rate") : undefined,
    avg_search_top_is: has("search_top_impression_share") ? avg("search_top_impression_share") : undefined,
    avg_abs_top_is: has("abs_top_impression_share") ? avg("abs_top_impression_share") : undefined,
  };
}

export function toResponse(rows: AdRow[]): AdsResponse {
  return { data: rows, summary: buildSummary(rows) };
}

// Shared retry helper with exponential backoff (matches WindsorClient behavior)
export async function fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
  throw lastErr;
}

// Extract numeric value from a field that may be number, string, or array of action objects.
// Used for Meta Graph API responses where conversions come as actions: [{action_type, value}].
// Ported from src/lib/windsor.ts extractValue() to preserve behavior.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractValue(field: any, actionType?: string): number {
  if (field === null || field === undefined) return 0;
  if (typeof field === "number") return field;
  if (typeof field === "string") return Number(field) || 0;
  if (Array.isArray(field) && field.length > 0) {
    if (actionType) {
      const match = field.find((a: { action_type: string }) => a.action_type === actionType);
      if (match) return Number(match.value) || 0;
    }
    const fallback =
      field.find((a: { action_type: string }) => a.action_type === "contact_total") ??
      field.find((a: { action_type: string }) => a.action_type?.includes("messaging_conversation_started")) ??
      field.find((a: { action_type: string }) => a.action_type === "lead") ??
      field[0];
    return Number(fallback?.value) || 0;
  }
  return 0;
}
