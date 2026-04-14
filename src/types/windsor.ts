// DEPRECATED — mantido apenas para compatibilidade durante a migracao
// de Windsor.ai para adapters nativos (Meta/Google/GA4).
// Novos arquivos devem importar de "@/types/ads".

export type {
  AdRow as WindsorRow,
  AdSummary as WindsorSummary,
  AdsResponse as WindsorResponse,
  DateRange,
  DatePreset,
  Strategy,
  GoalConfig,
} from "./ads";
