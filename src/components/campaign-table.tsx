"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent, formatCompact } from "@/lib/formatters";
import { WindsorRow } from "@/types/windsor";

interface Props {
  data: WindsorRow[];
  title?: string;
  loading?: boolean;
}

type SortKey = "campaign" | "spend" | "impressions" | "clicks" | "ctr" | "cpc" | "conversions" | "cost_per_conversion" | "roas";

const COLUMNS: { key: SortKey; label: string; format: (v: number) => string; hide?: string }[] = [
  { key: "campaign", label: "Campanha", format: () => "" },
  { key: "spend", label: "Investimento", format: formatCurrency },
  { key: "impressions", label: "Impressoes", format: formatCompact, hide: "hidden lg:table-cell" },
  { key: "clicks", label: "Cliques", format: formatCompact },
  { key: "ctr", label: "CTR", format: (v) => formatPercent(v), hide: "hidden md:table-cell" },
  { key: "cpc", label: "CPC", format: formatCurrency, hide: "hidden md:table-cell" },
  { key: "conversions", label: "Conv.", format: (v) => String(Math.round(v)) },
  { key: "cost_per_conversion", label: "CPA", format: formatCurrency, hide: "hidden lg:table-cell" },
  { key: "roas", label: "ROAS", format: (v) => v.toFixed(2) },
];

export function CampaignTable({ data, title = "Top Campanhas", loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 10;

  // Aggregate by campaign
  const campaignMap = new Map<string, WindsorRow>();
  for (const row of data) {
    const key = row.campaign ?? "Sem campanha";
    const existing = campaignMap.get(key);
    if (existing) {
      existing.spend += row.spend;
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.conversions += row.conversions;
    } else {
      campaignMap.set(key, { ...row, campaign: key });
    }
  }
  const aggregated = Array.from(campaignMap.values()).map((r) => ({
    ...r,
    ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
    cpc: r.clicks > 0 ? r.spend / r.clicks : 0,
    cost_per_conversion: r.conversions > 0 ? r.spend / r.conversions : 0,
    roas: r.spend > 0 ? (r.conversions * 100) / r.spend : 0,
  }));

  const sorted = [...aggregated].sort((a, b) => {
    const aVal = sortKey === "campaign" ? (a.campaign ?? "") : (a[sortKey] ?? 0);
    const bVal = sortKey === "campaign" ? (b.campaign ?? "") : (b[sortKey] ?? 0);
    if (typeof aVal === "string") return sortAsc ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const visible = sorted.slice(page * perPage, (page + 1) * perPage);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
    setPage(0);
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-muted rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl animate-fade-in overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    "px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors",
                    col.hide
                  )}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row, i) => (
              <tr key={i} className="hover:bg-accent/50 transition-colors">
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3",
                      col.key === "campaign" ? "font-medium truncate max-w-[200px]" : "text-muted-foreground",
                      col.key === "roas" && (row.roas >= 1 ? "text-primary font-semibold" : "text-destructive"),
                      col.hide
                    )}
                  >
                    {col.key === "campaign" ? (row.campaign ?? "—") : col.format(row[col.key] as number)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
          <span>{sorted.length} campanhas</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-2 py-1 rounded border border-border disabled:opacity-30 hover:bg-accent">Anterior</button>
            <span className="px-2 py-1">{page + 1}/{totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 rounded border border-border disabled:opacity-30 hover:bg-accent">Proximo</button>
          </div>
        </div>
      )}
    </div>
  );
}
