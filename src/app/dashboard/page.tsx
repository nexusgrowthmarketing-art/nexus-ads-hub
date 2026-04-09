"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { DateRangePicker } from "@/components/date-range-picker";
import { AccountSelector } from "@/components/account-selector";
import { StrategyFilter } from "@/components/strategy-filter";
import { GoalBadge } from "@/components/goal-badge";
import { KpiSummary } from "@/components/kpi-summary";
import { PyramidKpis } from "@/components/pyramid-kpis";
import { ChartCombo } from "@/components/chart-combo";
import { ChartMonthly } from "@/components/chart-monthly";
import { MetaCampaignTable } from "@/components/meta-campaign-table";
import { GoogleCampaignTable } from "@/components/google-campaign-table";
import { EmptyState } from "@/components/empty-state";
import { useWindsorData } from "@/hooks/use-windsor-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useAccount } from "@/hooks/use-account";
import { WindsorResponse, Strategy } from "@/types/windsor";
import { detectStrategy } from "@/lib/constants";

export default function DashboardPage() {
  const { dateRange, preset, setPreset, setDateRange } = useDateRange();
  const { accountId, setAccountId } = useAccount();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const acct = accountId === "all" ? undefined : accountId;

  const { data: metaData, isLoading: metaLoading, lastUpdated, refetch } = useWindsorData<WindsorResponse>("meta", dateRange, acct);
  const { data: googleData, isLoading: googleLoading } = useWindsorData<WindsorResponse>("google-ads", dateRange, acct);

  const isLoading = metaLoading || googleLoading;

  // Filter by strategy
  const filteredMeta = useMemo(() => {
    if (!metaData?.data) return [];
    if (strategies.length === 0) return metaData.data;
    return metaData.data.filter((row) => {
      const s = detectStrategy(row.campaign ?? "");
      return s && strategies.includes(s);
    });
  }, [metaData, strategies]);

  const filteredGoogle = useMemo(() => {
    if (!googleData?.data) return [];
    if (strategies.length === 0) return googleData.data;
    return googleData.data.filter((row) => {
      const s = detectStrategy(row.campaign ?? "");
      return s && strategies.includes(s);
    });
  }, [googleData, strategies]);

  // Aggregations
  const metaSpend = filteredMeta.reduce((s, r) => s + r.spend, 0);
  const metaConv = filteredMeta.reduce((s, r) => s + r.conversions, 0);
  const metaClicks = filteredMeta.reduce((s, r) => s + r.clicks, 0);
  const metaImpressions = filteredMeta.reduce((s, r) => s + r.impressions, 0);

  const googleSpend = filteredGoogle.reduce((s, r) => s + r.spend, 0);
  const googleConv = filteredGoogle.reduce((s, r) => s + r.conversions, 0);
  const googleClicks = filteredGoogle.reduce((s, r) => s + r.clicks, 0);
  const googleImpressions = filteredGoogle.reduce((s, r) => s + r.impressions, 0);

  const totalConversions = metaConv + googleConv;
  const totalSpend = metaSpend + googleSpend;
  const costPerResult = totalConversions > 0 ? totalSpend / totalConversions : 0;

  // Daily chart: C/Resultado + Resultado
  const dailyCombo = useMemo(() => {
    const map: Record<string, { conv: number; spend: number }> = {};
    for (const row of [...filteredMeta, ...filteredGoogle]) {
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
  }, [filteredMeta, filteredGoogle]);

  // Monthly chart: M:Investido + G:Investido + Total
  const monthlyInvestido = useMemo(() => {
    const map: Record<string, { meta: number; google: number }> = {};
    for (const row of filteredMeta) {
      const m = row.date.substring(0, 7);
      if (!map[m]) map[m] = { meta: 0, google: 0 };
      map[m].meta += row.spend;
    }
    for (const row of filteredGoogle) {
      const m = row.date.substring(0, 7);
      if (!map[m]) map[m] = { meta: 0, google: 0 };
      map[m].google += row.spend;
    }
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        month: months[parseInt(key.split("-")[1]) - 1] || key,
        meta: v.meta,
        google: v.google,
        total: v.meta + v.google,
      }));
  }, [filteredMeta, filteredGoogle]);

  // Monthly chart: M:Resultado + G:Resultado + Total
  const monthlyResultado = useMemo(() => {
    const map: Record<string, { meta: number; google: number }> = {};
    for (const row of filteredMeta) {
      const m = row.date.substring(0, 7);
      if (!map[m]) map[m] = { meta: 0, google: 0 };
      map[m].meta += row.conversions;
    }
    for (const row of filteredGoogle) {
      const m = row.date.substring(0, 7);
      if (!map[m]) map[m] = { meta: 0, google: 0 };
      map[m].google += row.conversions;
    }
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        month: months[parseInt(key.split("-")[1]) - 1] || key,
        meta: v.meta,
        google: v.google,
        total: v.meta + v.google,
      }));
  }, [filteredMeta, filteredGoogle]);

  // Monthly CPR
  const monthlyCPR = useMemo(() => {
    const map: Record<string, { metaSpend: number; metaConv: number; googleSpend: number; googleConv: number }> = {};
    for (const row of filteredMeta) {
      const m = row.date.substring(0, 7);
      if (!map[m]) map[m] = { metaSpend: 0, metaConv: 0, googleSpend: 0, googleConv: 0 };
      map[m].metaSpend += row.spend;
      map[m].metaConv += row.conversions;
    }
    for (const row of filteredGoogle) {
      const m = row.date.substring(0, 7);
      if (!map[m]) map[m] = { metaSpend: 0, metaConv: 0, googleSpend: 0, googleConv: 0 };
      map[m].googleSpend += row.spend;
      map[m].googleConv += row.conversions;
    }
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        month: months[parseInt(key.split("-")[1]) - 1] || key,
        meta: v.metaConv > 0 ? v.metaSpend / v.metaConv : 0,
        google: v.googleConv > 0 ? v.googleSpend / v.googleConv : 0,
        total: (v.metaConv + v.googleConv) > 0 ? (v.metaSpend + v.googleSpend) / (v.metaConv + v.googleConv) : 0,
      }));
  }, [filteredMeta, filteredGoogle]);

  // Pyramid data
  const metaCPC = metaClicks > 0 ? metaSpend / metaClicks : 0;
  const metaCTR = metaImpressions > 0 ? (metaClicks / metaImpressions) * 100 : 0;
  const metaCostPerResult = metaConv > 0 ? metaSpend / metaConv : 0;
  const metaResultRate = metaClicks > 0 ? (metaConv / metaClicks) * 100 : 0;

  const googleCPC = googleClicks > 0 ? googleSpend / googleClicks : 0;
  const googleCTR = googleImpressions > 0 ? (googleClicks / googleImpressions) * 100 : 0;
  const googleCostPerResult = googleConv > 0 ? googleSpend / googleConv : 0;
  const googleResultRate = googleClicks > 0 ? (googleConv / googleClicks) * 100 : 0;

  const hasData = filteredMeta.length > 0 || filteredGoogle.length > 0;

  return (
    <>
      <Header title="Dashboard de Performance" lastUpdated={lastUpdated} onRefresh={refetch} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AccountSelector value={accountId} onChange={setAccountId} />
            <StrategyFilter selected={strategies} onChange={setStrategies} />
          </div>
          <div className="flex items-center gap-2">
            <GoalBadge
              currentValue={totalConversions}
              goalKey={`${accountId}_${strategies.join(",") || "all"}`}
              loading={isLoading}
            />
            <DateRangePicker dateRange={dateRange} preset={preset} onPresetChange={setPreset} onDateRangeChange={setDateRange} />
          </div>
        </div>

        {!hasData && !isLoading ? (
          <EmptyState />
        ) : (
          <>
            {/* Row 1: KPI Summary + Daily Combo Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <KpiSummary
                investido={totalSpend}
                resultado={totalConversions}
                costPerResult={costPerResult}
                meta={{
                  spend: metaSpend,
                  result: metaConv,
                  costPerResult: metaCostPerResult,
                }}
                google={{
                  spend: googleSpend,
                  result: googleConv,
                  costPerResult: googleCostPerResult,
                }}
                loading={isLoading}
              />
              <ChartCombo
                data={dailyCombo}
                title="C/Resultado — Resultado"
                barLabel="C/Resultado"
                lineLabel="Resultado"
                loading={isLoading}
              />
            </div>

            {/* Row 2: Pyramid KPIs (Meta + Google side by side) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PyramidKpis
                platform="meta"
                data={{
                  impressions: metaImpressions,
                  clicks: metaClicks,
                  result: metaConv,
                  resultLabel: "Mensagens",
                  cpc: metaCPC,
                  ctr: metaCTR,
                  costPerResult: metaCostPerResult,
                  costPerResultLabel: "C/Mensagem",
                  resultRate: metaResultRate,
                  resultRateLabel: "% Mensagem",
                }}
                loading={isLoading}
              />
              <PyramidKpis
                platform="google"
                data={{
                  impressions: googleImpressions,
                  clicks: googleClicks,
                  result: googleConv,
                  resultLabel: "Conversoes",
                  cpc: googleCPC,
                  ctr: googleCTR,
                  costPerResult: googleCostPerResult,
                  costPerResultLabel: "C/Conversao",
                  resultRate: googleResultRate,
                  resultRateLabel: "% Conversao",
                }}
                loading={isLoading}
              />
            </div>

            {/* Row 3: Monthly charts */}
            <ChartMonthly
              data={monthlyInvestido}
              title="Investimento Mensal por Plataforma"
              metaLabel="M: Investido"
              googleLabel="G: Investido"
              totalLabel="Total Investido"
              loading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartMonthly
                data={monthlyResultado}
                title="Resultados Mensais"
                metaLabel="M: Resultado"
                googleLabel="G: Resultado"
                totalLabel="Resultado Total"
                loading={isLoading}
              />
              <ChartMonthly
                data={monthlyCPR}
                title="CPR Mensal"
                metaLabel="M: CPR"
                googleLabel="G: CPR"
                totalLabel="Total CPR"
                loading={isLoading}
              />
            </div>

            {/* Row 4: Tables */}
            {filteredMeta.length > 0 && (
              <MetaCampaignTable data={filteredMeta} loading={isLoading} />
            )}
            {filteredGoogle.length > 0 && (
              <GoogleCampaignTable data={filteredGoogle} loading={isLoading} />
            )}
          </>
        )}
      </main>
    </>
  );
}
