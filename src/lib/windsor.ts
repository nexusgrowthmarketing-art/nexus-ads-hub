import { WindsorRow, WindsorSummary, WindsorResponse } from "@/types/windsor";
import { WINDSOR_FIELDS, WINDSOR_CONNECTORS } from "@/lib/constants";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;

interface CacheEntry {
  data: WindsorResponse;
  timestamp: number;
}

class WindsorClient {
  private cache = new Map<string, CacheEntry>();
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WINDSOR_API_KEY ?? "";
    this.baseUrl = process.env.WINDSOR_BASE_URL ?? "https://connectors.windsor.ai";
  }

  private getCacheKey(connector: string, dateFrom: string, dateTo: string, accountId?: string): string {
    return `${connector}:${dateFrom}:${dateTo}:${accountId ?? "all"}`;
  }

  private getFromCache(key: string): WindsorResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: WindsorResponse): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<unknown[]> {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, { next: { revalidate: 300 } });
        if (!res.ok) throw new Error(`Windsor API error: ${res.status}`);
        const json = await res.json();
        return Array.isArray(json) ? json : json.data ?? [];
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
    return [];
  }

  private parseRows(raw: unknown[]): WindsorRow[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return raw.map((row: any) => ({
      date: String(row.date ?? ""),
      source: row.source ?? undefined,
      medium: row.medium ?? undefined,
      campaign: row.campaign ?? undefined,
      adset: row.adset ?? undefined,
      ad_name: row.ad_name ?? undefined,
      spend: Number(row.spend ?? 0),
      impressions: Number(row.impressions ?? 0),
      clicks: Number(row.clicks ?? 0),
      ctr: Number(row.ctr ?? 0),
      cpm: Number(row.cpm ?? 0),
      cpc: Number(row.cpc ?? 0),
      conversions: Number(row.conversions ?? 0),
      cost_per_conversion: Number(row.cost_per_conversion ?? 0),
      roas: Number(row.roas ?? 0),
      sessions: row.sessions !== undefined ? Number(row.sessions) : undefined,
      users: row.users !== undefined ? Number(row.users) : undefined,
      bounce_rate: row.bounce_rate !== undefined ? Number(row.bounce_rate) : undefined,
      pageviews: row.pageviews !== undefined ? Number(row.pageviews) : undefined,
    }));
  }

  private calcSummary(rows: WindsorRow[]): WindsorSummary {
    const len = rows.length || 1;
    return {
      total_spend: rows.reduce((s, r) => s + r.spend, 0),
      total_clicks: rows.reduce((s, r) => s + r.clicks, 0),
      total_impressions: rows.reduce((s, r) => s + r.impressions, 0),
      total_conversions: rows.reduce((s, r) => s + r.conversions, 0),
      avg_ctr: rows.reduce((s, r) => s + r.ctr, 0) / len,
      avg_cpm: rows.reduce((s, r) => s + r.cpm, 0) / len,
      avg_cpc: rows.reduce((s, r) => s + r.cpc, 0) / len,
      avg_roas: rows.reduce((s, r) => s + r.roas, 0) / len,
      total_sessions: rows.some((r) => r.sessions !== undefined)
        ? rows.reduce((s, r) => s + (r.sessions ?? 0), 0)
        : undefined,
      total_users: rows.some((r) => r.users !== undefined)
        ? rows.reduce((s, r) => s + (r.users ?? 0), 0)
        : undefined,
      total_pageviews: rows.some((r) => r.pageviews !== undefined)
        ? rows.reduce((s, r) => s + (r.pageviews ?? 0), 0)
        : undefined,
      avg_bounce_rate: rows.some((r) => r.bounce_rate !== undefined)
        ? rows.reduce((s, r) => s + (r.bounce_rate ?? 0), 0) / len
        : undefined,
    };
  }

  private async fetch(
    connector: keyof typeof WINDSOR_CONNECTORS,
    fields: string,
    dateFrom: string,
    dateTo: string,
    accountId?: string
  ): Promise<WindsorResponse> {
    const cacheKey = this.getCacheKey(connector, dateFrom, dateTo, accountId);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      api_key: this.apiKey,
      fields,
      date_from: dateFrom,
      date_to: dateTo,
      _renderer: "json",
    });
    if (accountId) params.set("account_id", accountId);

    const url = `${this.baseUrl}/${WINDSOR_CONNECTORS[connector]}?${params}`;
    const raw = await this.fetchWithRetry(url);
    const data = this.parseRows(raw);
    const summary = this.calcSummary(data);
    const response = { data, summary };

    this.setCache(cacheKey, response);
    return response;
  }

  async fetchMetaAds(dateFrom: string, dateTo: string, accountId?: string) {
    return this.fetch("meta", WINDSOR_FIELDS.meta, dateFrom, dateTo, accountId);
  }

  async fetchGoogleAds(dateFrom: string, dateTo: string, accountId?: string) {
    return this.fetch("google_ads", WINDSOR_FIELDS.google_ads, dateFrom, dateTo, accountId);
  }

  async fetchAnalytics(dateFrom: string, dateTo: string, accountId?: string) {
    return this.fetch("analytics", WINDSOR_FIELDS.analytics, dateFrom, dateTo, accountId);
  }

  async fetchAll(dateFrom: string, dateTo: string, accountId?: string) {
    return this.fetch("all", WINDSOR_FIELDS.all, dateFrom, dateTo, accountId);
  }
}

export const windsor = new WindsorClient();
