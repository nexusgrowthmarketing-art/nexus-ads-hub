import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { AdRow } from "@/types/ads";
import { DataSourceAdapter, FetchInsightsOptions } from "./base";
import { getCached, setCached, buildCacheKey } from "./cache";

export class GA4Adapter implements DataSourceAdapter {
  readonly name = "ga4" as const;
  private client: BetaAnalyticsDataClient | null = null;

  constructor() {
    const keyJson = process.env.GA4_SERVICE_ACCOUNT_KEY;
    if (!keyJson) return;

    try {
      // Support both raw JSON and base64-encoded JSON
      const decoded = keyJson.trim().startsWith("{")
        ? keyJson
        : Buffer.from(keyJson, "base64").toString("utf-8");
      const credentials = JSON.parse(decoded);

      this.client = new BetaAnalyticsDataClient({ credentials });
    } catch (err) {
      console.error("[GA4Adapter] Failed to parse GA4_SERVICE_ACCOUNT_KEY:", err);
    }
  }

  async fetchInsights(opts: FetchInsightsOptions): Promise<AdRow[]> {
    if (!this.client) {
      console.warn("[GA4Adapter] Not configured");
      return [];
    }

    const propertyIds = opts.accountIds?.length
      ? opts.accountIds
      : (process.env.GA4_PROPERTY_IDS ?? "").split(",").filter(Boolean);

    if (propertyIds.length === 0) {
      console.warn("[GA4Adapter] No property IDs configured");
      return [];
    }

    const results = await Promise.all(
      propertyIds.map((pid) => this.fetchProperty(pid.trim(), opts.dateFrom, opts.dateTo))
    );

    return results.flat();
  }

  private async fetchProperty(propertyId: string, dateFrom: string, dateTo: string): Promise<AdRow[]> {
    const cacheKey = buildCacheKey(["ga4", propertyId, dateFrom, dateTo]);
    const cached = getCached<AdRow[]>(cacheKey);
    if (cached) return cached;

    if (!this.client) return [];

    try {
      const [response] = await this.client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: dateFrom, endDate: dateTo }],
        dimensions: [
          { name: "date" },
          { name: "sessionSource" },
          { name: "sessionMedium" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
        ],
      });

      const rows = (response.rows ?? []).map((r) => this.normalize(r, propertyId));
      setCached(cacheKey, rows);
      return rows;
    } catch (err) {
      console.error(`[GA4Adapter] Error fetching property ${propertyId}:`, err);
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalize(row: any, propertyId: string): AdRow {
    const dims = row.dimensionValues ?? [];
    const metrics = row.metricValues ?? [];

    // GA4 returns date as YYYYMMDD; normalize to YYYY-MM-DD
    const rawDate = dims[0]?.value ?? "";
    const date =
      rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate;

    return {
      date,
      platform: "ga4",
      account_id: propertyId,
      account_name: `GA4 Property ${propertyId}`,
      source: dims[1]?.value,
      medium: dims[2]?.value,

      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpm: 0,
      cpc: 0,
      conversions: 0,
      cost_per_conversion: 0,
      roas: 0,

      sessions: Number(metrics[0]?.value ?? 0),
      users: Number(metrics[1]?.value ?? 0),
      pageviews: Number(metrics[2]?.value ?? 0),
      bounce_rate: Number(metrics[3]?.value ?? 0) * 100,
    };
  }
}

export const ga4Adapter = new GA4Adapter();
