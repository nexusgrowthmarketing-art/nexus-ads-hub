"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent, formatNumber, formatCompact, calcVariation } from "@/lib/formatters";

type Format = "currency" | "percent" | "number" | "compact";

interface Props {
  label: string;
  value: number;
  previousValue?: number;
  format?: Format;
  icon?: React.ReactNode;
  highlight?: boolean;
  loading?: boolean;
}

function formatValue(value: number, fmt: Format): string {
  switch (fmt) {
    case "currency": return formatCurrency(value);
    case "percent": return formatPercent(value);
    case "compact": return formatCompact(value);
    default: return formatNumber(value);
  }
}

export function KpiCard({ label, value, previousValue, format = "number", icon, highlight, loading }: Props) {
  const variation = previousValue !== undefined ? calcVariation(value, previousValue) : null;
  const isPositive = variation !== null && variation >= 0;
  const barWidth = previousValue && previousValue > 0
    ? Math.min((value / previousValue) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-3 bg-muted rounded w-1/2 mb-3" />
        <div className="h-7 bg-muted rounded w-2/3 mb-2" />
        <div className="h-2 bg-muted rounded w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-muted-foreground opacity-60">{icon}</span>}
      </div>

      <p className={cn(
        "text-2xl font-bold tracking-tight",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {formatValue(value, format)}
      </p>

      {variation !== null && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
            isPositive ? "text-[#22C55E] bg-[#22C55E]/10" : "text-[#EF4444] bg-[#EF4444]/10"
          )}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(variation).toFixed(1)}%
          </span>
          <span className="text-[10px] text-muted-foreground">vs anterior</span>
        </div>
      )}

      {barWidth > 0 && (
        <div className="w-full bg-muted rounded-full h-1 mt-3">
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: `${barWidth}%`,
              backgroundColor: isPositive ? "#84CC16" : "#EF4444",
            }}
          />
        </div>
      )}
    </div>
  );
}
