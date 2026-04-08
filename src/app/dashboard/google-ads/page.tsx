"use client";

import { Header } from "@/components/header";
import { DateRangePicker } from "@/components/date-range-picker";
import { KpiCard } from "@/components/kpi-card";
import { KpiGrid } from "@/components/kpi-grid";
import { ChartArea } from "@/components/chart-area";
import { ChartBar } from "@/components/chart-bar";
import { CampaignTable } from "@/components/campaign-table";
import { EmptyState } from "@/components/empty-state";
import { useWindsorData } from "@/hooks/use-windsor-data";
import { useDateRange } from "@/hooks/use-date-range";
import { WindsorResponse } from "@/types/windsor";
import { DollarSign, Target, Banknote, Percent } from "lucide-react";

export default function GoogleAdsPage() {
  const { dateRange, preset, setPreset, setDateRange } = useDateRange();
  const { data, isLoading, lastUpdated, refetch } = useWindsorData<WindsorResponse>("google-ads", dateRange);

  const chartData = data?.data
    ? Object.entries(
        data.data.reduce<Record<string, number>>((acc, row) => {
          const d = row.date.substring(0, 10);
          acc[d] = (acc[d] ?? 0) + row.spend;
          return acc;
        }, {})
      ).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date: date.substring(5).replace("-", "/"), value }))
    : [];

  // Top campaigns by conversions
  const campMap: Record<string, number> = {};
  for (const row of data?.data ?? []) {
    const name = row.campaign ?? "Sem campanha";
    campMap[name] = (campMap[name] ?? 0) + row.conversions;
  }
  const topCampaigns = Object.entries(campMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const s = data?.summary;
  const convRate = s && s.total_clicks > 0 ? (s.total_conversions / s.total_clicks) * 100 : 0;

  return (
    <>
      <Header title="Google Ads" lastUpdated={lastUpdated} onRefresh={refetch} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Google Ads</span>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Busca</span>
          </div>
          <DateRangePicker dateRange={dateRange} preset={preset} onPresetChange={setPreset} onDateRangeChange={setDateRange} />
        </div>

        <KpiGrid>
          <KpiCard label="Investimento" value={s?.total_spend ?? 0} format="currency" icon={<DollarSign className="w-4 h-4" />} highlight loading={isLoading} />
          <KpiCard label="Conversoes" value={s?.total_conversions ?? 0} format="number" icon={<Target className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="CPC" value={s?.avg_cpc ?? 0} format="currency" icon={<Banknote className="w-4 h-4" />} loading={isLoading} />
          <KpiCard label="Taxa Conversao" value={convRate} format="percent" icon={<Percent className="w-4 h-4" />} loading={isLoading} />
        </KpiGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartArea data={chartData} title="Investimento Diario" loading={isLoading} />
          <ChartBar data={topCampaigns} title="Top 10 Campanhas por Conversoes" horizontal loading={isLoading} />
        </div>

        {data?.data && data.data.length > 0 ? (
          <CampaignTable data={data.data} title="Campanhas Google Ads" loading={isLoading} />
        ) : !isLoading ? <EmptyState /> : null}
      </main>
    </>
  );
}
