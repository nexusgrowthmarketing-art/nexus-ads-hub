import { AdRow } from "@/types/ads";
import { DataSourceAdapter, FetchInsightsOptions, fetchWithRetry, extractValue } from "./base";
import { getCached, setCached, buildCacheKey } from "./cache";

const GRAPH_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Fields we request from the Graph API insights endpoint.
// `actions` + `action_values` return arrays; `cost_per_action_type` too.
const INSIGHTS_FIELDS = [
  "date_start",
  "campaign_id",
  "campaign_name",
  "adset_id",
  "adset_name",
  "ad_id",
  "ad_name",
  "account_id",
  "account_name",
  "spend",
  "impressions",
  "clicks",
  "ctr",
  "cpm",
  "cpc",
  "actions",
  "action_values",
  "cost_per_action_type",
  "video_p100_watched_actions",
  "video_thruplay_watched_actions",
].join(",");

// Action types that map to our normalized "conversions" / "messages" / "checkouts" / etc.
const CONVERSION_ACTION_TYPES = [
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "lead",
  "onsite_conversion.lead_grouped",
  "contact_total",
];

const MESSAGE_ACTION_TYPES = [
  "onsite_conversion.messaging_conversation_started_7d",
  "onsite_conversion.total_messaging_connection",
];

const LANDING_PAGE_VIEW_ACTION = "landing_page_view";
const CHECKOUT_ACTION_TYPES = ["initiate_checkout", "offsite_conversion.fb_pixel_initiate_checkout"];

interface MetaInsightsRow {
  date_start: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  account_id?: string;
  account_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpm?: string;
  cpc?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  video_p100_watched_actions?: Array<{ action_type: string; value: string }>;
}

interface MetaApiResponse {
  data: MetaInsightsRow[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
  };
  error?: { message: string; code: number };
}

export class MetaAdsAdapter implements DataSourceAdapter {
  readonly name = "meta" as const;
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN ?? "";
  }

  async fetchInsights(opts: FetchInsightsOptions): Promise<AdRow[]> {
    if (!this.accessToken) {
      console.warn("[MetaAdsAdapter] META_ACCESS_TOKEN not configured");
      return [];
    }

    const accountIds = opts.accountIds?.length
      ? opts.accountIds
      : (process.env.META_AD_ACCOUNT_IDS ?? "").split(",").filter(Boolean);

    if (accountIds.length === 0) {
      console.warn("[MetaAdsAdapter] No ad accounts configured");
      return [];
    }

    // Fetch all accounts in parallel
    const allRows = await Promise.all(
      accountIds.map((acctId) => this.fetchAccountInsights(acctId, opts.dateFrom, opts.dateTo))
    );

    return allRows.flat();
  }

  private async fetchAccountInsights(
    accountId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<AdRow[]> {
    const normalizedId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;
    const cacheKey = buildCacheKey(["meta", normalizedId, dateFrom, dateTo]);
    const cached = getCached<AdRow[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      access_token: this.accessToken,
      level: "ad",
      fields: INSIGHTS_FIELDS,
      time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
      time_increment: "1", // daily breakdown
      limit: "500",
    });

    const url = `${BASE_URL}/${normalizedId}/insights?${params}`;

    try {
      const rows = await this.fetchPaginated(url);
      const normalized = rows.map((r) => this.normalize(r));
      setCached(cacheKey, normalized);
      return normalized;
    } catch (err) {
      console.error(`[MetaAdsAdapter] Error fetching ${normalizedId}:`, err);
      return [];
    }
  }

  private async fetchPaginated(initialUrl: string): Promise<MetaInsightsRow[]> {
    const all: MetaInsightsRow[] = [];
    let url: string | undefined = initialUrl;
    let pages = 0;
    const MAX_PAGES = 50; // safety

    while (url && pages < MAX_PAGES) {
      const res = await fetchWithRetry(url);
      const json = (await res.json()) as MetaApiResponse;
      if (json.error) throw new Error(`Meta API: ${json.error.message}`);
      if (json.data) all.push(...json.data);
      url = json.paging?.next;
      pages++;
    }

    return all;
  }

  private normalize(row: MetaInsightsRow): AdRow {
    const actions = row.actions ?? [];
    const costPerAction = row.cost_per_action_type ?? [];

    const conversions = this.sumActions(actions, CONVERSION_ACTION_TYPES);
    const messages = this.sumActions(actions, MESSAGE_ACTION_TYPES);
    const landingPageViews = extractValue(actions, LANDING_PAGE_VIEW_ACTION);
    const checkouts = this.sumActions(actions, CHECKOUT_ACTION_TYPES);
    const videoViews = extractValue(row.video_p100_watched_actions, "video_view");

    const spend = Number(row.spend) || 0;
    const clicks = Number(row.clicks) || 0;
    const impressions = Number(row.impressions) || 0;

    const cpr = this.findCostPerAction(costPerAction, CONVERSION_ACTION_TYPES);

    return {
      date: row.date_start,
      platform: "meta",
      account_id: row.account_id,
      account_name: row.account_name,
      campaign: row.campaign_name,
      campaign_id: row.campaign_id,
      adset: row.adset_name,
      adset_id: row.adset_id,
      ad_name: row.ad_name,
      ad_id: row.ad_id,

      spend,
      impressions,
      clicks,
      ctr: Number(row.ctr) || 0,
      cpm: Number(row.cpm) || 0,
      cpc: Number(row.cpc) || 0,
      conversions,
      cost_per_conversion: cpr || (conversions > 0 ? spend / conversions : 0),
      roas: spend > 0 ? (conversions * 100) / spend : 0,

      messages,
      landing_page_views: landingPageViews,
      checkouts,
      video_views: videoViews,
    };
  }

  private sumActions(
    actions: Array<{ action_type: string; value: string }>,
    types: string[]
  ): number {
    return actions
      .filter((a) => types.includes(a.action_type))
      .reduce((s, a) => s + (Number(a.value) || 0), 0);
  }

  private findCostPerAction(
    costs: Array<{ action_type: string; value: string }>,
    types: string[]
  ): number {
    for (const t of types) {
      const match = costs.find((c) => c.action_type === t);
      if (match) return Number(match.value) || 0;
    }
    return 0;
  }
}

export const metaAdapter = new MetaAdsAdapter();
