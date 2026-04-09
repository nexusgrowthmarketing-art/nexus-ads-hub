export interface WindsorRow {
  date: string;
  source?: string;
  medium?: string;
  campaign?: string;
  adset?: string;
  ad_name?: string;
  ad_id?: string;
  account_name?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  cpc: number;
  conversions: number;
  cost_per_conversion: number;
  roas: number;
  sessions?: number;
  users?: number;
  bounce_rate?: number;
  pageviews?: number;
  // Meta Ads specific
  messages?: number;
  landing_page_views?: number;
  checkouts?: number;
  video_views?: number;
  hook_rate?: number;
  // Google Ads specific
  keyword?: string;
  conversion_rate?: number;
  phone_calls?: number;
  interactions?: number;
  interaction_rate?: number;
  search_impression_share?: number;
  search_top_impression_share?: number;
  abs_top_impression_share?: number;
  campaign_type?: string;
  ad_type?: string;
}

export interface WindsorSummary {
  total_spend: number;
  total_clicks: number;
  total_impressions: number;
  total_conversions: number;
  avg_ctr: number;
  avg_cpm: number;
  avg_cpc: number;
  avg_roas: number;
  total_sessions?: number;
  total_users?: number;
  total_pageviews?: number;
  avg_bounce_rate?: number;
  // Meta specific
  total_messages?: number;
  total_landing_page_views?: number;
  total_checkouts?: number;
  cost_per_message?: number;
  message_rate?: number;
  cost_per_checkout?: number;
  cost_per_pageview?: number;
  connect_rate?: number;
  // Google specific
  total_phone_calls?: number;
  total_interactions?: number;
  avg_conversion_rate?: number;
  avg_interaction_rate?: number;
  avg_search_top_is?: number;
  avg_abs_top_is?: number;
  total_video_views?: number;
  video_view_rate?: number;
}

export interface WindsorResponse {
  data: WindsorRow[];
  summary: WindsorSummary;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type DatePreset =
  | "today"
  | "yesterday"
  | "last_7d"
  | "last_14d"
  | "last_30d"
  | "this_month"
  | "last_month"
  | "custom";

export type Strategy = "mensagens" | "leads" | "trafego_direto" | "ecommerce" | "distribuicao";

export interface GoalConfig {
  reference: number;
  target: number;
}
