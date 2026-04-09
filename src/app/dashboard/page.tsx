"use client";

import { Header } from "@/components/header";
import { DateRangePicker } from "@/components/date-range-picker";
import { AccountSelector } from "@/components/account-selector";
import { KpiCard } from "@/components/kpi-card";
import { KpiGrid } from "@/components/kpi-grid";
import { ChartArea } from "@/components/chart-area";
import { ChartDonut } from "@/components/chart-donut";
import { CampaignTable } from "@/components/campaign-table";
import { EmptyState } from "@/components/empty-state";
import { useWindsorData } from "@/hooks/use-windsor-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useAccount } from "@/hooks/use-account";
import { WindsorResponse } from "@/types/windsor";
import { DollarSign, MousePointerClick, Eye, Target } from "lucide-react";

export default function DashboardPage() {
  const { dateRange, preset, setPreset, setDateRange } = useDateRange();
  const { accountId, setAccountId } = useAccount();
  const acct = accountId === "all" ? undefined : accountId;
  const { data, isLoading, lastUpdated, refetch } = useWindsorData<WindsorResponse>("all", dateRange, acct);

  const chartData = data?.data
    ? Object.entries(
        data.data.reduce<Record<string, number>>((acc, row) => {
          const d = row.date.substring(0, 10);
          acc[d] = (acc[d] ?? 0) + row.spend;
          return acc;
        }, {})
      ).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date: date.substring(5).replace("-", "/"), value }))
    : [];

  const platformData = data?.data
    ? (() => {
        const map: Record<string, number> = {};
        for (const row of data.data) {
          const src = (row.source ?? "Outro").toLowerCase();
          const name = src.includes("facebook") || src.includes("instagram") || src.includes("meta")
            ? "Meta Ads" : src.includes("google") ? "Google Ads" : "Outro";
          map[name] = (map[name] ?? 0) + row.spend;
        }
        return Object.entries(map).map(([name, value]) => ({ name, value }));
      })()
    : [];

  const s = data?.summary;

  return (
    <>
      <Header title="Visao Geral" lastUpdated={lastUpdated} onRefresh={refetch} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Midia Paga — Investimento & Performance
          </p>
          <div className="flex items-center gap-2">
            <AccountSelector value={accountId} onChange={setAccountId} />
            <DateRangePicker dateRange={dateRange} preset={preset} onPresetChange={setPreset} onDateRangeChange={setDateRange} />
          </div>
        </div>

        <KpiGrid>
          <KpiCard label="Investimento Total" value={s?.total_spend ?? 0} format="currency" icon={<DollarSign className="w-4 h-4" />} highlight loading={isLoading} />
          <KpiCard label="Cliques Totais" value={s?.total_clicks ?? 0} format="compact" icon={<MousePointerClick className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="Impressoes" value={s?.total_impressions ?? 0} format="compact" icon={<Eye className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="Conversoes" value={s?.total_conversions ?? 0} format="number" icon={<Target className="w-4 h-4" />} loading={isLoading} />
        </KpiGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartArea data={chartData} title="Investimento Diario" loading={isLoading} />
          </div>
          <ChartDonut data={platformData} title="Investimento por Plataforma" loading={isLoading} />
        </div>

        {data?.data && data.data.length > 0 ? (
          <CampaignTable data={data.data} loading={isLoading} />
        ) : !isLoading ? <EmptyState /> : null}
      </main>
    </>
  );
}
