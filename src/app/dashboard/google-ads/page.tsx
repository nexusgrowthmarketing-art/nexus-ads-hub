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
import { GoogleCampaignTable } from "@/components/google-campaign-table";
import { EmptyState } from "@/components/empty-state";
import { useWindsorData } from "@/hooks/use-windsor-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useAccount } from "@/hooks/use-account";
import { WindsorResponse, Strategy } from "@/types/windsor";
import { detectStrategy } from "@/lib/constants";
import { formatPercent, formatCompact } from "@/lib/formatters";
import { Phone, Video, Search, BarChart2, MousePointerClick, Eye } from "lucide-react";

export default function GoogleAdsPage() {
  const { dateRange, preset, setPreset, setDateRange } = useDateRange();
  const { accountId, setAccountId } = useAccount();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedAdGroup, setSelectedAdGroup] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedAd, setSelectedAd] = useState("");
  const acct = accountId === "all" ? undefined : accountId;

  const { data, isLoading, lastUpdated, refetch } = useWindsorData<WindsorResponse>("google-ads", dateRange, acct);

  // Filter pipeline
  const filtered = useMemo(() => {
    let rows = data?.data ?? [];
    if (strategies.length > 0) {
      rows = rows.filter((row) => {
        const s = detectStrategy(row.campaign ?? "");
        return s && strategies.includes(s);
      });
    }
    if (selectedCampaign) rows = rows.filter((r) => r.campaign === selectedCampaign);
    if (selectedAdGroup) rows = rows.filter((r) => r.adset === selectedAdGroup);
    if (selectedKeyword) rows = rows.filter((r) => r.keyword === selectedKeyword);
    if (selectedAd) rows = rows.filter((r) => r.ad_name === selectedAd);
    return rows;
  }, [data, strategies, selectedCampaign, selectedAdGroup, selectedKeyword, selectedAd]);

  // Unique values for sub-filters
  const campaigns = useMemo(() => Array.from(new Set((data?.data ?? []).map((r) => r.campaign).filter(Boolean) as string[])), [data]);
  const adGroups = useMemo(() => Array.from(new Set(filtered.map((r) => r.adset).filter(Boolean) as string[])), [filtered]);
  const keywords = useMemo(() => Array.from(new Set(filtered.map((r) => r.keyword).filter(Boolean) as string[])), [filtered]);
  const ads = useMemo(() => Array.from(new Set(filtered.map((r) => r.ad_name).filter(Boolean) as string[])), [filtered]);

  // Aggregations
  const spend = filtered.reduce((s, r) => s + r.spend, 0);
  const conv = filtered.reduce((s, r) => s + r.conversions, 0);
  const clicks = filtered.reduce((s, r) => s + r.clicks, 0);
  const impressions = filtered.reduce((s, r) => s + r.impressions, 0);
  const cpc = clicks > 0 ? spend / clicks : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const costPerConversion = conv > 0 ? spend / conv : 0;
  const convRate = clicks > 0 ? (conv / clicks) * 100 : 0;

  // Extra KPIs
  const totalInteractions = filtered.reduce((s, r) => s + (r.interactions ?? r.clicks), 0);
  const totalPhoneCalls = filtered.reduce((s, r) => s + (r.phone_calls ?? 0), 0);
  const totalVideoViews = filtered.reduce((s, r) => s + (r.video_views ?? 0), 0);
  const avgSearchTopIS = filtered.length > 0
    ? filtered.reduce((s, r) => s + (r.search_top_impression_share ?? 0), 0) / filtered.length
    : 0;
  const interactionRate = impressions > 0 ? (totalInteractions / impressions) * 100 : 0;
  const phoneClickRate = totalInteractions > 0 ? totalPhoneCalls : 0;
  const videoViewRate = impressions > 0 ? (totalVideoViews / impressions) * 100 : 0;
  const avgAbsTopIS = filtered.length > 0
    ? filtered.reduce((s, r) => s + (r.abs_top_impression_share ?? 0), 0) / filtered.length
    : 0;

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

  return (
    <>
      <Header title="Google Ads" lastUpdated={lastUpdated} onRefresh={refetch} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Global filters */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AccountSelector value={accountId} onChange={setAccountId} />
            <StrategyFilter selected={strategies} onChange={setStrategies} />
          </div>
          <div className="flex items-center gap-2">
            <GoalBadge
              currentValue={conv}
              goalKey={`google_${accountId}_${strategies.join(",") || "all"}`}
              loading={isLoading}
            />
            <DateRangePicker dateRange={dateRange} preset={preset} onPresetChange={setPreset} onDateRangeChange={setDateRange} />
          </div>
        </div>

        {/* Sub-filters */}
        <SubFilters
          campaigns={campaigns}
          adsets={adGroups}
          ads={ads}
          keywords={keywords}
          selectedCampaign={selectedCampaign}
          selectedAdset={selectedAdGroup}
          selectedAd={selectedAd}
          selectedKeyword={selectedKeyword}
          onCampaignChange={setSelectedCampaign}
          onAdsetChange={setSelectedAdGroup}
          onAdChange={setSelectedAd}
          onKeywordChange={setSelectedKeyword}
          showKeyword
        />

        {filtered.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <>
            {/* KPI Summary + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <KpiSummary
                investido={spend}
                resultado={conv}
                costPerResult={costPerConversion}
                loading={isLoading}
              />
              <ChartCombo
                data={dailyCombo}
                title="Conversoes — C/Conversao"
                barLabel="C/Conversao"
                lineLabel="Conversoes"
                loading={isLoading}
              />
            </div>

            {/* Pyramid */}
            <PyramidKpis
              platform="google"
              data={{
                impressions,
                clicks,
                result: conv,
                resultLabel: "Conversoes",
                cpc,
                ctr,
                costPerResult: costPerConversion,
                costPerResultLabel: "C/Conversao",
                resultRate: convRate,
                resultRateLabel: "% Conversao",
              }}
              loading={isLoading}
            />

            {/* Extra KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Interacoes", value: formatCompact(totalInteractions), icon: <MousePointerClick className="w-3.5 h-3.5" /> },
                { label: "Impress. Chamadas", value: String(totalPhoneCalls), icon: <Phone className="w-3.5 h-3.5" /> },
                { label: "VideoViews", value: formatCompact(totalVideoViews), icon: <Video className="w-3.5 h-3.5" /> },
                { label: "Search (Top) IS", value: formatPercent(avgSearchTopIS), icon: <Search className="w-3.5 h-3.5" /> },
                { label: "Taxa de interacao", value: formatPercent(interactionRate), icon: <BarChart2 className="w-3.5 h-3.5" /> },
                { label: "Cliques em Chamadas", value: String(phoneClickRate), icon: <Phone className="w-3.5 h-3.5" /> },
                { label: "% Videoview", value: formatPercent(videoViewRate), icon: <Video className="w-3.5 h-3.5" /> },
                { label: "Impression (Abs Top) %", value: formatPercent(avgAbsTopIS), icon: <Eye className="w-3.5 h-3.5" /> },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-card border border-border rounded-xl px-4 py-3 animate-fade-in">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-muted-foreground">{kpi.icon}</span>
                    <p className="text-[9px] text-muted-foreground uppercase font-medium truncate">{kpi.label}</p>
                  </div>
                  <p className="text-sm font-bold">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">N/A</p>
                </div>
              ))}
            </div>

            {/* Campaign table */}
            <GoogleCampaignTable data={filtered} loading={isLoading} />
          </>
        )}
      </main>
    </>
  );
}
