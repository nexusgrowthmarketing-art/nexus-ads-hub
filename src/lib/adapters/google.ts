import { GoogleAdsApi } from "google-ads-api";
import { AdRow } from "@/types/ads";
import { DataSourceAdapter, FetchInsightsOptions } from "./base";
import { getCached, setCached, buildCacheKey } from "./cache";

interface GAQLRow {
  campaign?: { id?: string; name?: string; status?: string; advertising_channel_type?: string };
  ad_group?: { id?: string; name?: string };
  ad_group_ad?: { ad?: { id?: string; name?: string } };
  customer?: { id?: string; descriptive_name?: string };
  segments?: { date?: string };
  metrics?: {
    cost_micros?: string;
    impressions?: string;
    clicks?: string;
    ctr?: number;
    average_cpm?: string;
    average_cpc?: string;
    conversions?: number;
    cost_per_conversion?: number;
    phone_calls?: string;
    video_views?: string;
    interactions?: string;
    interaction_rate?: number;
    search_top_impression_share?: number;
    search_absolute_top_impression_share?: number;
  };
}

export class GoogleAdsAdapter implements DataSourceAdapter {
  readonly name = "google" as const;
  private client: GoogleAdsApi | null = null;
  private developerToken: string;
  private refreshToken: string;

  constructor() {
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "";
    this.refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN ?? "";

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID ?? "";
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET ?? "";

    if (this.developerToken && clientId && clientSecret) {
      this.client = new GoogleAdsApi({
        client_id: clientId,
        client_secret: clientSecret,
        developer_token: this.developerToken,
      });
    }
  }

  async fetchInsights(opts: FetchInsightsOptions): Promise<AdRow[]> {
    if (!this.client || !this.refreshToken) {
      console.warn("[GoogleAdsAdapter] Google Ads API not configured");
      return [];
    }

    const customerIds = opts.accountIds?.length
      ? opts.accountIds
      : (process.env.GOOGLE_ADS_CUSTOMER_IDS ?? "").split(",").filter(Boolean);

    if (customerIds.length === 0) {
      console.warn("[GoogleAdsAdapter] No customer IDs configured");
      return [];
    }

    const results = await Promise.all(
      customerIds.map((cid) => this.fetchCustomer(cid.replace(/-/g, ""), opts.dateFrom, opts.dateTo))
    );

    return results.flat();
  }

  private async fetchCustomer(customerId: string, dateFrom: string, dateTo: string): Promise<AdRow[]> {
    const cacheKey = buildCacheKey(["google", customerId, dateFrom, dateTo]);
    const cached = getCached<AdRow[]>(cacheKey);
    if (cached) return cached;

    if (!this.client) return [];

    const customer = this.client.Customer({
      customer_id: customerId,
      refresh_token: this.refreshToken,
    });

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        ad_group.id,
        ad_group.name,
        ad_group_ad.ad.id,
        ad_group_ad.ad.name,
        customer.id,
        customer.descriptive_name,
        segments.date,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpm,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.phone_calls,
        metrics.video_views,
        metrics.interactions,
        metrics.interaction_rate,
        metrics.search_top_impression_share,
        metrics.search_absolute_top_impression_share
      FROM ad_group_ad
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
    `;

    try {
      const rows = (await customer.query(query)) as GAQLRow[];
      const normalized = rows.map((r) => this.normalize(r));
      setCached(cacheKey, normalized);
      return normalized;
    } catch (err) {
      console.error(`[GoogleAdsAdapter] Error fetching customer ${customerId}:`, err);
      return [];
    }
  }

  private normalize(row: GAQLRow): AdRow {
    const m = row.metrics ?? {};
    const spend = Number(m.cost_micros ?? 0) / 1_000_000;
    const clicks = Number(m.clicks ?? 0);
    const impressions = Number(m.impressions ?? 0);
    const conversions = Number(m.conversions ?? 0);

    return {
      date: row.segments?.date ?? "",
      platform: "google",
      account_id: row.customer?.id,
      account_name: row.customer?.descriptive_name,
      campaign: row.campaign?.name,
      campaign_id: row.campaign?.id,
      campaign_status: (row.campaign?.status as AdRow["campaign_status"]) ?? "UNKNOWN",
      campaign_type: row.campaign?.advertising_channel_type,
      adset: row.ad_group?.name,
      adset_id: row.ad_group?.id,
      ad_name: row.ad_group_ad?.ad?.name,
      ad_id: row.ad_group_ad?.ad?.id,

      spend,
      impressions,
      clicks,
      ctr: (Number(m.ctr) || 0) * 100,
      cpm: Number(m.average_cpm ?? 0) / 1_000_000,
      cpc: Number(m.average_cpc ?? 0) / 1_000_000,
      conversions,
      cost_per_conversion: Number(m.cost_per_conversion ?? 0),
      roas: spend > 0 ? (conversions * 100) / spend : 0,

      phone_calls: Number(m.phone_calls ?? 0),
      video_views: Number(m.video_views ?? 0),
      interactions: Number(m.interactions ?? 0),
      interaction_rate: (Number(m.interaction_rate) || 0) * 100,
      search_top_impression_share: (Number(m.search_top_impression_share) || 0) * 100,
      abs_top_impression_share: (Number(m.search_absolute_top_impression_share) || 0) * 100,
      conversion_rate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    };
  }
}

export const googleAdapter = new GoogleAdsAdapter();
