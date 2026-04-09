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
  meta: "date,campaign,ad_name,ad_id,account_name,spend,impressions,clicks,ctr,cpm,cpc,conversions,cost_per_conversion",
  google_ads: "date,campaign,account_name,spend,impressions,clicks,ctr,cpm,cpc,conversions,cost_per_conversion",
  analytics: "date,source,medium,sessions,users,bounce_rate,pageviews",
  all: "date,source,medium,campaign,account_name,spend,impressions,clicks,conversions",
};

export const WINDSOR_CONNECTORS = {
  meta: "facebook",
  google_ads: "google_ads",
  analytics: "googleanalytics4",
  all: "all",
};

// Accounts - match by account_name field from Windsor API
export const ACCOUNTS = [
  { id: "all", label: "Todas as contas", match: [] as string[] },
  { id: "kdb_automotivo", label: "KDB Automotivo", match: ["kdb  automotivo", "kdb automotivo"] },
  { id: "kdb_moveleiro", label: "KDB Moveleiro", match: ["kdb moveleiro"] },
  { id: "savanna", label: "Savanna Cubas", match: ["savanna"] },
  { id: "impressora", label: "Impressora Nacional", match: ["impressora nacional"] },
];

// Match row's account_name to selected account
export function matchAccount(accountName: string | undefined, accountId: string): boolean {
  if (accountId === "all") return true;
  if (!accountName) return false;
  const account = ACCOUNTS.find((a) => a.id === accountId);
  if (!account || account.match.length === 0) return true;
  const lower = accountName.toLowerCase();
  return account.match.some((kw) => lower.includes(kw));
}

// Strategy detection from campaign naming conventions
// Priority order: specific keywords first, then broader ones
export function detectStrategy(campaignName: string): Strategy | null {
  const lower = campaignName.toLowerCase();

  // eCommerce: purchase/shop/loja keywords
  if (["shop", "loja", "ecommerce", "purchase", "checkout", "venda na loja"].some((kw) => lower.includes(kw))) {
    return "ecommerce";
  }

  // Leads: conversion campaigns, form captures
  if (["[conv]", "lead", "formulario", "form", "captacao", "cadastro"].some((kw) => lower.includes(kw))) {
    return "leads";
  }

  // Mensagens: WhatsApp, Direct, message campaigns
  if (["whatsapp", "mensag", "message", "direct", "[msg]", "[dm]"].some((kw) => lower.includes(kw))) {
    return "mensagens";
  }

  // Trafego Direto: site traffic campaigns
  if (["site ->", "site ", "landing", "trafego", "traffic", "visita"].some((kw) => lower.includes(kw))) {
    return "trafego_direto";
  }

  // Distribuicao: awareness, reach, remarketing, engagement without specific destination
  if (["distribuicao", "alcance", "awareness", "reconhecimento", "brand", "rmk", "engaja"].some((kw) => lower.includes(kw))) {
    return "distribuicao";
  }

  return null;
}
