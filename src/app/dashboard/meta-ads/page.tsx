"use client";

import { Header } from "@/components/header";
import { DateRangePicker } from "@/components/date-range-picker";
import { AccountSelector } from "@/components/account-selector";
import { KpiCard } from "@/components/kpi-card";
import { KpiGrid } from "@/components/kpi-grid";
import { ChartArea } from "@/components/chart-area";
import { ChartBar } from "@/components/chart-bar";
import { CampaignTable } from "@/components/campaign-table";
import { EmptyState } from "@/components/empty-state";
import { useWindsorData } from "@/hooks/use-windsor-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useAccount } from "@/hooks/use-account";
import { WindsorResponse } from "@/types/windsor";
import { DollarSign, TrendingUp, Banknote, MousePointerClick } from "lucide-react";

export default function MetaAdsPage() {
  const { dateRange, preset, setPreset, setDateRange } = useDateRange();
  const { accountId, setAccountId } = useAccount();
  const acct = accountId === "all" ? undefined : accountId;
  const { data, isLoading, lastUpdated, refetch } = useWindsorData<WindsorResponse>("meta", dateRange, acct);

  const chartData = data?.data
    ? Object.entries(
        data.data.reduce<Record<string, number>>((acc, row) => {
          const d = row.date.substring(0, 10);
          acc[d] = (acc[d] ?? 0) + row.spend;
          return acc;
        }, {})
      ).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date: date.substring(5).replace("-", "/"), value }))
    : [];

  const adsetMap: Record<string, number> = {};
  for (const row of data?.data ?? []) {
    const name = row.adset ?? "Sem conjunto";
    adsetMap[name] = (adsetMap[name] ?? 0) + row.spend;
  }
  const topAdsets = Object.entries(adsetMap).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, value]) => ({ name, value }));

  const s = data?.summary;

  return (
    <>
      <Header title="Meta Ads" lastUpdated={lastUpdated} onRefresh={refetch} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Meta Ads</span>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Instagram + Facebook</span>
          </div>
          <div className="flex items-center gap-2">
            <AccountSelector value={accountId} onChange={setAccountId} />
            <DateRangePicker dateRange={dateRange} preset={preset} onPresetChange={setPreset} onDateRangeChange={setDateRange} />
          </div>
        </div>

        <KpiGrid>
          <KpiCard label="Investimento" value={s?.total_spend ?? 0} format="currency" icon={<DollarSign className="w-4 h-4" />} highlight loading={isLoading} />
          <KpiCard label="ROAS" value={s?.avg_roas ?? 0} format="number" icon={<TrendingUp className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="CPA" value={s?.total_conversions ? (s.total_spend / s.total_conversions) : 0} format="currency" icon={<Banknote className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="CTR" value={s?.avg_ctr ?? 0} format="percent" icon={<MousePointerClick className="w-4 h-4" />} loading={isLoading} />
        </KpiGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartArea data={chartData} title="Investimento Diario" loading={isLoading} />
          <ChartBar data={topAdsets} title="Top 10 Conjuntos de Anuncios" horizontal loading={isLoading} />
        </div>

        {data?.data && data.data.length > 0 ? (
          <CampaignTable data={data.data} title="Campanhas Meta Ads" loading={isLoading} />
        ) : !isLoading ? <EmptyState /> : null}
      </main>
    </>
  );
}
