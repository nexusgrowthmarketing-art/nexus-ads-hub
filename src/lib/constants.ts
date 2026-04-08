export const DATE_PRESETS = [
  { label: "Hoje", value: "today" as const },
  { label: "Ontem", value: "yesterday" as const },
  { label: "Ultimos 7 dias", value: "last_7d" as const },
  { label: "Ultimos 14 dias", value: "last_14d" as const },
  { label: "Ultimos 30 dias", value: "last_30d" as const },
  { label: "Este mes", value: "this_month" as const },
  { label: "Mes passado", value: "last_month" as const },
];

export const WINDSOR_FIELDS = {
  meta: "date,campaign,adset,ad_name,spend,impressions,clicks,ctr,cpm,cpc,conversions,cost_per_conversion,roas",
  google_ads: "date,campaign,spend,impressions,clicks,ctr,cpm,cpc,conversions,cost_per_conversion",
  analytics: "date,source,medium,sessions,users,bounce_rate,pageviews",
  all: "date,source,medium,campaign,spend,impressions,clicks,conversions",
};

export const WINDSOR_CONNECTORS = {
  meta: "facebook",
  google_ads: "google_ads",
  analytics: "googleanalytics4",
  all: "all",
};
