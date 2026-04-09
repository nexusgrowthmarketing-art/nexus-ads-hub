"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/formatters";

interface PyramidData {
  impressions: number;
  impressionsVar?: number;
  clicks: number;
  clicksVar?: number;
  result: number;
  resultVar?: number;
  resultLabel: string;
  cpc: number;
  cpcVar?: number;
  ctr: number;
  ctrVar?: number;
  costPerResult: number;
  costPerResultVar?: number;
  costPerResultLabel: string;
  resultRate: number;
  resultRateVar?: number;
  resultRateLabel: string;
  // Extra row
  extraLeft?: { label: string; value: string; variation?: number };
  extraRight?: { label: string; value: string; variation?: number };
}

interface Props {
  data: PyramidData;
  platform: "meta" | "google";
  loading?: boolean;
}

function VariationBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return <span className="text-[10px] text-muted-foreground">N/A</span>;
  const isPositive = value >= 0;
  return (
    <span className={cn(
      "flex items-center gap-0.5 text-[10px] font-medium",
      isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
    )}>
      {isPositive ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function PyramidKpis({ data, platform, loading }: Props) {
  const icon = platform === "meta" ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3c1.5 0 3.2 1.6 4.2 4.3.7 1.8 1 3.6 1 4.7 0 1.3-.3 2-.8 2s-1.2-.9-2.4-2.7C13 11.7 12.5 11 12 11s-1 .7-2 2.3C8.8 15.1 8 16 7.5 16s-.8-.7-.8-2c0-1.1.3-2.9 1-4.7C8.8 6.6 10.5 5 12 5z" fill="currentColor"/>
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 19.5h20L12 2zm0 4l6.9 12H5.1L12 6z" fill="currentColor"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-5 bg-muted rounded w-12 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded-xl mx-4" />
          <div className="h-14 bg-muted rounded-xl mx-8" />
          <div className="h-14 bg-muted rounded-xl mx-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-foreground">{icon}</span>
      </div>

      {/* Level 1: Impressions (widest) */}
      <div className="relative mb-2">
        <div className="bg-accent/80 border border-border rounded-xl px-4 py-3 mx-0">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[10px] absolute -left-1 top-1/2 -translate-y-1/2 hidden xl:block" />
            <div className="text-center flex-1">
              <p className="text-[10px] text-muted-foreground uppercase">Impressoes</p>
              <p className="text-xl font-bold">{formatCompact(data.impressions)}</p>
              <VariationBadge value={data.impressionsVar} />
            </div>
            <span className="text-muted-foreground text-[10px] absolute -right-1 top-1/2 -translate-y-1/2 hidden xl:block" />
          </div>
        </div>
      </div>

      {/* Side KPIs: CPC | CTR */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="text-left">
          <p className="text-[9px] text-muted-foreground uppercase">CPC</p>
          <p className="text-xs font-bold">{formatCurrency(data.cpc)}</p>
          <VariationBadge value={data.cpcVar} />
        </div>
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground uppercase">CTR</p>
          <p className="text-xs font-bold">{formatPercent(data.ctr)}</p>
          <VariationBadge value={data.ctrVar} />
        </div>
      </div>

      {/* Level 2: Clicks (medium) */}
      <div className="relative mb-2">
        <div className="bg-accent/60 border border-border rounded-xl px-4 py-3 mx-6">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Cliques</p>
            <p className="text-xl font-bold">{formatCompact(data.clicks)}</p>
            <VariationBadge value={data.clicksVar} />
          </div>
        </div>
      </div>

      {/* Side KPIs: CostPerResult | ResultRate */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="text-left">
          <p className="text-[9px] text-muted-foreground uppercase">{data.costPerResultLabel}</p>
          <p className="text-xs font-bold">{formatCurrency(data.costPerResult)}</p>
          <VariationBadge value={data.costPerResultVar} />
        </div>
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground uppercase">{data.resultRateLabel}</p>
          <p className="text-xs font-bold">{formatPercent(data.resultRate)}</p>
          <VariationBadge value={data.resultRateVar} />
        </div>
      </div>

      {/* Level 3: Results (narrowest) */}
      <div className="relative mb-2">
        <div className="bg-accent/40 border border-border rounded-xl px-4 py-3 mx-12">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase">{data.resultLabel}</p>
            <p className="text-xl font-bold">{formatCompact(data.result)}</p>
            <VariationBadge value={data.resultVar} />
          </div>
        </div>
      </div>

      {/* Extra bottom row */}
      {(data.extraLeft || data.extraRight) && (
        <div className="flex items-center justify-between px-2 mt-2">
          {data.extraLeft && (
            <div className="text-left">
              <p className="text-[9px] text-muted-foreground uppercase">{data.extraLeft.label}</p>
              <p className="text-xs font-bold">{data.extraLeft.value}</p>
              <VariationBadge value={data.extraLeft.variation} />
            </div>
          )}
          {data.extraRight && (
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground uppercase">{data.extraRight.label}</p>
              <p className="text-xs font-bold">{data.extraRight.value}</p>
              <VariationBadge value={data.extraRight.variation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
