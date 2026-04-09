"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCompact } from "@/lib/formatters";
import { WindsorRow } from "@/types/windsor";

interface Props {
  data: WindsorRow[];
  loading?: boolean;
}

type SortKey = "campaign" | "spend" | "conversions" | "cost_per_conversion" | "roas" | "checkouts" | "pageviews" | "cost_per_pageview";

interface AggRow {
  campaign: string;
  spend: number;
  conversions: number;
  cost_per_conversion: number;
  roas: number;
  checkouts: number;
  cost_per_checkout: number;
  pageviews: number;
  cost_per_pageview: number;
}

const COLUMNS: { key: SortKey; label: string; format: (v: number) => string; hide?: string }[] = [
  { key: "campaign", label: "Campanha", format: () => "" },
  { key: "spend", label: "Investido", format: formatCurrency },
  { key: "conversions", label: "Resultado", format: (v) => String(Math.round(v)) },
  { key: "cost_per_conversion", label: "C/Resultado", format: formatCurrency },
  { key: "roas", label: "Retorno", format: (v) => v > 0 ? formatCurrency(v) : "-" },
  { key: "checkouts", label: "Checkouts", format: (v) => v > 0 ? String(Math.round(v)) : "-", hide: "hidden lg:table-cell" },
  { key: "pageviews", label: "PageViews", format: formatCompact, hide: "hidden md:table-cell" },
  { key: "cost_per_pageview", label: "C/Pageview", format: (v) => v > 0 ? formatCurrency(v) : "-", hide: "hidden lg:table-cell" },
];

export function MetaCampaignTable({ data, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 10;

  const campaignMap = new Map<string, AggRow>();
  for (const row of data) {
    const key = row.campaign ?? "Sem campanha";
    const existing = campaignMap.get(key);
    if (existing) {
      existing.spend += row.spend;
      existing.conversions += row.conversions;
      existing.checkouts += row.checkouts ?? 0;
      existing.pageviews += row.landing_page_views ?? row.pageviews ?? 0;
    } else {
      campaignMap.set(key, {
        campaign: key,
        spend: row.spend,
        conversions: row.conversions,
        cost_per_conversion: 0,
        roas: 0,
        checkouts: row.checkouts ?? 0,
        cost_per_checkout: 0,
        pageviews: row.landing_page_views ?? row.pageviews ?? 0,
        cost_per_pageview: 0,
      });
    }
  }

  const aggregated = Array.from(campaignMap.values()).map((r) => ({
    ...r,
    cost_per_conversion: r.conversions > 0 ? r.spend / r.conversions : 0,
    roas: r.spend > 0 ? (r.conversions * 100) / r.spend : 0,
    cost_per_checkout: r.checkouts > 0 ? r.spend / r.checkouts : 0,
    cost_per_pageview: r.pageviews > 0 ? r.spend / r.pageviews : 0,
  }));

  // Totals
  const totals: AggRow = aggregated.reduce((acc, r) => ({
    campaign: "Total",
    spend: acc.spend + r.spend,
    conversions: acc.conversions + r.conversions,
    cost_per_conversion: 0,
    roas: 0,
    checkouts: acc.checkouts + r.checkouts,
    cost_per_checkout: 0,
    pageviews: acc.pageviews + r.pageviews,
    cost_per_pageview: 0,
  }), { campaign: "Total", spend: 0, conversions: 0, cost_per_conversion: 0, roas: 0, checkouts: 0, cost_per_checkout: 0, pageviews: 0, cost_per_pageview: 0 });
  totals.cost_per_conversion = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  totals.cost_per_pageview = totals.pageviews > 0 ? totals.spend / totals.pageviews : 0;

  const sorted = [...aggregated].sort((a, b) => {
    const aVal = sortKey === "campaign" ? a.campaign : a[sortKey];
    const bVal = sortKey === "campaign" ? b.campaign : b[sortKey];
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
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-muted rounded mb-2" />)}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl animate-fade-in overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Meta Ads</h3>
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
                      col.key === "campaign" ? "font-medium truncate max-w-[250px]" : "text-muted-foreground",
                      col.hide
                    )}
                  >
                    {col.key === "campaign" ? row.campaign : col.format(row[col.key] as number)}
                  </td>
                ))}
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-accent/30 font-semibold border-t-2 border-border">
              {COLUMNS.map((col) => (
                <td key={col.key} className={cn("px-4 py-3", col.hide)}>
                  {col.key === "campaign" ? "Total" : col.format(totals[col.key] as number)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
          <span>{sorted.length} campanhas</span>
          <div className="flex items-center gap-2">
            <span>{page * perPage + 1}-{Math.min((page + 1) * perPage, sorted.length)}/{sorted.length}</span>
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-1.5 py-0.5 rounded border border-border disabled:opacity-30 hover:bg-accent">&lt;</button>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-1.5 py-0.5 rounded border border-border disabled:opacity-30 hover:bg-accent">&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
}
