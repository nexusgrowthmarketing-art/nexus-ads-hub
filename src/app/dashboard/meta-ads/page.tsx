"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { DateRangePicker } from "@/components/date-range-picker";
import { AccountSelector } from "@/components/account-selector";
import { StrategyFilter } from "@/components/strategy-filter";
import { SubFilters } from "@/components/sub-filters";
import { GoalBadge } from "@/components/goal-badge";
import { KpiSummary } from "@/components/kpi-summary";
import { PyramidKpis } from "@/components/pyramid-kpis";
import { ChartCombo } from "@/components/chart-combo";
import { MetaCampaignTable } from "@/components/meta-campaign-table";
import { AdCreativeTable } from "@/components/ad-creative-table";
import { EmptyState } from "@/components/empty-state";
import { useWindsorData } from "@/hooks/use-windsor-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useAccount } from "@/hooks/use-account";
import { WindsorResponse, Strategy } from "@/types/windsor";
import { detectStrategy, matchAccount } from "@/lib/constants";

export default function MetaAdsPage() {
  const { dateRange, preset, setPreset, setDateRange } = useDateRange();
  const { accountId, setAccountId } = useAccount();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedAdset, setSelectedAdset] = useState("");
  const [selectedAd, setSelectedAd] = useState("");

  const { data, isLoading, lastUpdated, refetch } = useWindsorData<WindsorResponse>("meta", dateRange);

  // Filter pipeline: account -> strategy -> sub-filters
  const filtered = useMemo(() => {
    let rows = data?.data ?? [];
    rows = rows.filter((r) => matchAccount(r.account_name, accountId));
    if (strategies.length > 0) {
      rows = rows.filter((r) => {
        const s = detectStrategy(r.campaign ?? "");
        return s && strategies.includes(s);
      });
    }
    if (selectedCampaign) rows = rows.filter((r) => r.campaign === selectedCampaign);
    if (selectedAdset) rows = rows.filter((r) => r.adset === selectedAdset);
    if (selectedAd) rows = rows.filter((r) => r.ad_name === selectedAd);
    return rows;
  }, [data, accountId, strategies, selectedCampaign, selectedAdset, selectedAd]);

  // Unique values for sub-filters (from account-filtered data, not strategy-filtered)
  const accountFiltered = useMemo(() => {
    return (data?.data ?? []).filter((r) => matchAccount(r.account_name, accountId));
  }, [data, accountId]);

  const campaigns = useMemo(() => Array.from(new Set(accountFiltered.map((r) => r.campaign).filter(Boolean) as string[])), [accountFiltered]);
  const adsets = useMemo(() => Array.from(new Set(filtered.map((r) => r.adset).filter(Boolean) as string[])), [filtered]);
  const ads = useMemo(() => Array.from(new Set(filtered.map((r) => r.ad_name).filter(Boolean) as string[])), [filtered]);

  // Aggregations
  const spend = filtered.reduce((s, r) => s + r.spend, 0);
  const conv = filtered.reduce((s, r) => s + r.conversions, 0);
  const clicks = filtered.reduce((s, r) => s + r.clicks, 0);
  const impressions = filtered.reduce((s, r) => s + r.impressions, 0);
  const cpc = clicks > 0 ? spend / clicks : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const costPerResult = conv > 0 ? spend / conv : 0;
  const resultRate = clicks > 0 ? (conv / clicks) * 100 : 0;

  const resultLabel = strategies.includes("leads") ? "Leads"
    : strategies.includes("ecommerce") ? "Vendas"
    : "Resultado";
  const costPerResultLabel = `C/${resultLabel}`;
  const resultRateLabel = `% ${resultLabel}`;

  // Daily chart
  const dailyCombo = useMemo(() => {
    const map: Record<string, { conv: number; spend: number }> = {};
    for (const row of filtered) {
      const d = row.date.substring(0, 10);
      if (!map[d]) map[d] = { conv: 0, spend: 0 };
      map[d].conv += row.conversions;
      map[d].spend += row.spend;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: date.substring(5).replace("-", "/"),
        bar: v.conv > 0 ? v.spend / v.conv : 0,
        line: v.conv,
      }));
  }, [filtered]);

  const pvTotal = filtered.reduce((s, r) => s + (r.landing_page_views ?? r.pageviews ?? 0), 0);

  return (
    <>
      <Header title="Meta Ads" lastUpdated={lastUpdated} onRefresh={refetch} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AccountSelector value={accountId} onChange={setAccountId} />
            <StrategyFilter selected={strategies} onChange={setStrategies} />
          </div>
          <div className="flex items-center gap-2">
            <GoalBadge currentValue={conv} goalKey={`meta_${accountId}_${strategies.join(",") || "all"}`} loading={isLoading} />
            <DateRangePicker dateRange={dateRange} preset={preset} onPresetChange={setPreset} onDateRangeChange={setDateRange} />
          </div>
        </div>

        <SubFilters
          campaigns={campaigns} adsets={adsets} ads={ads}
          selectedCampaign={selectedCampaign} selectedAdset={selectedAdset} selectedAd={selectedAd}
          onCampaignChange={setSelectedCampaign} onAdsetChange={setSelectedAdset} onAdChange={setSelectedAd}
        />

        {filtered.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <KpiSummary investido={spend} resultado={conv} costPerResult={costPerResult} loading={isLoading} />
              <ChartCombo data={dailyCombo} title={`${costPerResultLabel} — ${resultLabel}`} barLabel={costPerResultLabel} lineLabel={resultLabel} loading={isLoading} />
            </div>

            <PyramidKpis
              platform="meta"
              data={{
                impressions, clicks, result: conv, resultLabel,
                cpc, ctr, costPerResult, costPerResultLabel, resultRate, resultRateLabel,
                extraLeft: { label: "C/PageView", value: pvTotal > 0 ? `R$ ${(spend / pvTotal).toFixed(2)}` : "R$ 0,00" },
                extraRight: { label: "PageViews", value: String(pvTotal) },
              }}
              loading={isLoading}
            />

            <MetaCampaignTable data={filtered} loading={isLoading} />
            <AdCreativeTable data={filtered} resultLabel={resultLabel} loading={isLoading} />
          </>
        )}
      </main>
    </>
  );
}
