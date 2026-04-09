"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

interface PlatformRow {
  spend: number;
  spendVar?: number;
  result: number;
  resultVar?: number;
  costPerResult: number;
  costPerResultVar?: number;
}

interface Props {
  investido: number;
  investidoTarget?: number;
  investidoPct?: number;
  resultado: number;
  resultadoPct?: number;
  costPerResult: number;
  costPerResultTarget?: number;
  costPerResultPct?: number;
  meta?: PlatformRow;
  google?: PlatformRow;
  loading?: boolean;
}

function VariationInline({ value }: { value?: number }) {
  if (value === undefined) return <span className="text-[10px] text-muted-foreground">N/A</span>;
  const isPositive = value >= 0;
  return (
    <span className={cn(
      "text-[10px] font-medium",
      isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
    )}>
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function ProgressBar({ pct, target, color }: { pct?: number; target?: number; color: string }) {
  if (!pct) return null;
  const width = Math.min(pct, 100);
  return (
    <div className="mt-1.5">
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      {target !== undefined && (
        <p className="text-[9px] text-muted-foreground text-right mt-0.5">
          {formatCurrency(target)}
        </p>
      )}
    </div>
  );
}

export function KpiSummary({
  investido,
  investidoTarget,
  investidoPct,
  resultado,
  resultadoPct,
  costPerResult,
  costPerResultTarget,
  costPerResultPct,
  meta,
  google,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 bg-muted rounded w-1/2 mb-2" />
              <div className="h-7 bg-muted rounded w-2/3 mb-2" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      {/* Top KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Investido</p>
          <p className="text-xl font-bold">{formatCurrency(investido)}</p>
          {investidoPct !== undefined && (
            <span className={cn("text-[10px] font-medium", investidoPct < 100 ? "text-[#22C55E]" : "text-[#EF4444]")}>
              {investidoPct.toFixed(1)}%
            </span>
          )}
          <ProgressBar pct={investidoPct} target={investidoTarget} color={investidoPct && investidoPct > 100 ? "#EF4444" : "#EF4444"} />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Resultado</p>
          <p className="text-xl font-bold">{Math.round(resultado)}</p>
          {resultadoPct !== undefined && (
            <span className={cn("text-[10px] font-medium", resultadoPct >= 100 ? "text-[#22C55E]" : "text-primary")}>
              {resultadoPct.toFixed(1)}%
            </span>
          )}
          <ProgressBar pct={resultadoPct} color={resultadoPct && resultadoPct >= 100 ? "#22C55E" : "#EAB308"} />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium">C/Resultado</p>
          <p className="text-xl font-bold">{formatCurrency(costPerResult)}</p>
          {costPerResultPct !== undefined && (
            <span className={cn("text-[10px] font-medium", costPerResultPct <= 100 ? "text-[#22C55E]" : "text-[#EF4444]")}>
              {costPerResultPct.toFixed(1)}%
            </span>
          )}
          <ProgressBar pct={costPerResultPct} target={costPerResultTarget} color={costPerResultPct && costPerResultPct <= 100 ? "#22C55E" : "#22C55E"} />
        </div>
      </div>

      {/* Platform breakdown */}
      <div className="border-t border-border pt-3 space-y-2">
        {meta && (
          <div className="flex items-center gap-3 text-xs">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3c1.5 0 3.2 1.6 4.2 4.3.7 1.8 1 3.6 1 4.7 0 1.3-.3 2-.8 2s-1.2-.9-2.4-2.7C13 11.7 12.5 11 12 11s-1 .7-2 2.3C8.8 15.1 8 16 7.5 16s-.8-.7-.8-2c0-1.1.3-2.9 1-4.7C8.8 6.6 10.5 5 12 5z"/>
            </svg>
            <span className="w-20">{formatCurrency(meta.spend)}</span>
            <VariationInline value={meta.spendVar} />
            <span className="w-10 text-center">{Math.round(meta.result)}</span>
            <VariationInline value={meta.resultVar} />
            <span className="w-20 text-right">{formatCurrency(meta.costPerResult)}</span>
            <VariationInline value={meta.costPerResultVar} />
          </div>
        )}
        {google && (
          <div className="flex items-center gap-3 text-xs">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19.5h20L12 2zm0 4l6.9 12H5.1L12 6z"/>
            </svg>
            <span className="w-20">{formatCurrency(google.spend)}</span>
            <VariationInline value={google.spendVar} />
            <span className="w-10 text-center">{Math.round(google.result)}</span>
            <VariationInline value={google.resultVar} />
            <span className="w-20 text-right">{formatCurrency(google.costPerResult)}</span>
            <VariationInline value={google.costPerResultVar} />
          </div>
        )}
      </div>
    </div>
  );
}
