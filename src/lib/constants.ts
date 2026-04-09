import { Strategy } from "@/types/windsor";

export const DATE_PRESETS = [
  { label: "Hoje", value: "today" as const },
  { label: "Ontem", value: "yesterday" as const },
  { label: "Ultimos 7 dias", value: "last_7d" as const },
  { label: "Ultimos 14 dias", value: "last_14d" as const },
  { label: "Ultimos 30 dias", value: "last_30d" as const },
  { label: "Este mes", value: "this_month" as const },
  { label: "Mes passado", value: "last_month" as const },
];

export const STRATEGIES: { value: Strategy; label: string }[] = [
  { value: "distribuicao", label: "Distribuicao" },
  { value: "mensagens", label: "Mensagens" },
  { value: "leads", label: "Leads" },
  { value: "trafego_direto", label: "Trafego Direto" },
  { value: "ecommerce", label: "eCommerce" },
];

export const WINDSOR_FIELDS = {
  meta: "date,campaign,ad_name,ad_id,spend,impressions,clicks,ctr,cpm,cpc,conversions,cost_per_conversion",
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

export const ACCOUNTS = [
  { id: "all", label: "Todas as contas" },
  { id: "1259313081920836", label: "KDB Automotivo" },
  { id: "888644596732484", label: "KDB Moveleiro" },
  { id: "930705436097687", label: "Savanna Cubas" },
  { id: "895401665782936", label: "Impressora Nacional" },
];

// Strategy keywords used to detect strategy from campaign names
export const STRATEGY_KEYWORDS: Record<Strategy, string[]> = {
  mensagens: ["mensag", "message", "msg", "whatsapp", "direct", "dm"],
  leads: ["lead", "formulario", "form", "captacao", "cadastro"],
  trafego_direto: ["trafego", "traffic", "site", "landing", "visita"],
  ecommerce: ["venda", "compra", "ecommerce", "shop", "loja", "conversao", "purchase", "checkout"],
  distribuicao: ["distribuicao", "alcance", "awareness", "reconhecimento", "brand"],
};

export function detectStrategy(campaignName: string): Strategy | null {
  const lower = campaignName.toLowerCase();
  for (const [strategy, keywords] of Object.entries(STRATEGY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return strategy as Strategy;
    }
  }
  return null;
}
