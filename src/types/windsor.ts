export interface WindsorRow {
  date: string;
  source?: string;
  medium?: string;
  campaign?: string;
  adset?: string;
  ad_name?: string;
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
