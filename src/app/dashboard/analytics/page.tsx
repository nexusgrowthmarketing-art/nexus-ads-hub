"use client";

import { Header } from "@/components/header";
import { DateRangePicker } from "@/components/date-range-picker";
import { KpiCard } from "@/components/kpi-card";
import { KpiGrid } from "@/components/kpi-grid";
import { ChartArea } from "@/components/chart-area";
import { ChartBar } from "@/components/chart-bar";
import { EmptyState } from "@/components/empty-state";
import { AccountSelector } from "@/components/account-selector";
import { useWindsorData } from "@/hooks/use-windsor-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useAccount } from "@/hooks/use-account";
import { WindsorResponse } from "@/types/windsor";
import { Users, FileText, ArrowDownUp } from "lucide-react";

export default function AnalyticsPage() {
  const { dateRange, preset, setPreset, setDateRange } = useDateRange();
  const { accountId, setAccountId } = useAccount();
  const { data, isLoading, lastUpdated, refetch } = useWindsorData<WindsorResponse>("analytics", dateRange);

  const chartData = data?.data
    ? Object.entries(
        data.data.reduce<Record<string, number>>((acc, row) => {
          const d = row.date.substring(0, 10);
          acc[d] = (acc[d] ?? 0) + (row.sessions ?? 0);
          return acc;
        }, {})
      ).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date: date.substring(5).replace("-", "/"), value }))
    : [];

  const sourceMap: Record<string, number> = {};
  for (const row of data?.data ?? []) {
    const name = [row.source, row.medium].filter(Boolean).join(" / ") || "Direto";
    sourceMap[name] = (sourceMap[name] ?? 0) + (row.sessions ?? 0);
  }
  const topSources = Object.entries(sourceMap).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, value]) => ({ name, value }));

  const s = data?.summary;

  return (
    <>
      <Header title="Google Analytics 4" lastUpdated={lastUpdated} onRefresh={refetch} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Google Analytics 4</span>
          <div className="flex items-center gap-2">
            <AccountSelector value={accountId} onChange={setAccountId} />
            <DateRangePicker dateRange={dateRange} preset={preset} onPresetChange={setPreset} onDateRangeChange={setDateRange} />
          </div>
        </div>

        <KpiGrid>
          <KpiCard label="Sessoes" value={s?.total_sessions ?? 0} format="compact" icon={<Users className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="Usuarios" value={s?.total_users ?? 0} format="compact" icon={<Users className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="Pageviews" value={s?.total_pageviews ?? 0} format="compact" icon={<FileText className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="Bounce Rate" value={s?.avg_bounce_rate ?? 0} format="percent" icon={<ArrowDownUp className="w-4 h-4" />} loading={isLoading} />
        </KpiGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartArea data={chartData} title="Sessoes Diarias" loading={isLoading} />
          <ChartBar data={topSources} title="Top 10 Fontes de Trafego" horizontal loading={isLoading} />
        </div>

        {!isLoading && (!data?.data || data.data.length === 0) && <EmptyState />}
      </main>
    </>
  );
}
