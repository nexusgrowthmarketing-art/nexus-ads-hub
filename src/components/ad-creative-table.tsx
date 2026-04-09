"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { WindsorRow } from "@/types/windsor";

interface Props {
  data: WindsorRow[];
  resultLabel?: string;
  loading?: boolean;
}

interface AdRow {
  ad_name: string;
  ad_id: string;
  spend: number;
  result: number;
  ctr: number;
  hook_rate: number;
  impressions: number;
  clicks: number;
  cpm: number;
}

export function AdCreativeTable({ data, resultLabel = "Mensagens", loading }: Props) {
  const [page, setPage] = useState(0);
  const perPage = 7;

  const adMap = new Map<string, AdRow>();
  for (const row of data) {
    const key = row.ad_name ?? row.ad_id ?? "Sem anuncio";
    const existing = adMap.get(key);
    if (existing) {
      existing.spend += row.spend;
      existing.result += row.conversions;
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
    } else {
      adMap.set(key, {
        ad_name: key,
        ad_id: row.ad_id ?? "",
        spend: row.spend,
        result: row.conversions,
        ctr: 0,
        hook_rate: row.hook_rate ?? 0,
        impressions: row.impressions,
        clicks: row.clicks,
        cpm: 0,
      });
    }
  }

  const aggregated = Array.from(adMap.values()).map((r) => ({
    ...r,
    ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
    cpm: r.impressions > 0 ? (r.spend / r.impressions) * 1000 : 0,
    hook_rate: r.hook_rate > 0 ? r.hook_rate : (r.clicks > 0 ? (r.result / r.clicks) * 100 : 0),
  })).sort((a, b) => b.spend - a.spend);

  const totalAds = aggregated.length;
  const totalPages = Math.ceil(totalAds / perPage);
  const visible = aggregated.slice(page * perPage, (page + 1) * perPage);

  const totalSpend = aggregated.reduce((s, r) => s + r.spend, 0);

  // CPM from all data
  const totalImpressions = aggregated.reduce((s, r) => s + r.impressions, 0);
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 w-32 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl animate-fade-in overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">CPM</p>
            <p className="text-sm font-bold">{formatCurrency(avgCpm)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Anuncio</th>
              {visible.map((ad, i) => (
                <th key={i} className="px-3 py-3 text-center min-w-[120px]">
                  <a
                    href={ad.ad_id ? `https://www.facebook.com/ads/library/?id=${ad.ad_id}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-[10px] flex items-center justify-center gap-1"
                  >
                    Ver Anuncio <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-accent/50">
              <td className="px-4 py-2.5 text-muted-foreground font-medium">Investido</td>
              {visible.map((ad, i) => (
                <td key={i} className="px-3 py-2.5 text-center">{formatCurrency(ad.spend)}</td>
              ))}
            </tr>
            <tr className="hover:bg-accent/50">
              <td className="px-4 py-2.5 text-muted-foreground font-medium">{resultLabel}</td>
              {visible.map((ad, i) => (
                <td key={i} className="px-3 py-2.5 text-center">{Math.round(ad.result)}</td>
              ))}
            </tr>
            <tr className="hover:bg-accent/50">
              <td className="px-4 py-2.5 text-muted-foreground font-medium">C/{resultLabel}</td>
              {visible.map((ad, i) => (
                <td key={i} className="px-3 py-2.5 text-center">
                  {ad.result > 0 ? formatCurrency(ad.spend / ad.result) : "-"}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-accent/50">
              <td className="px-4 py-2.5 text-muted-foreground font-medium">Cliques</td>
              {visible.map((ad, i) => (
                <td key={i} className="px-3 py-2.5 text-center">{ad.clicks}</td>
              ))}
            </tr>
            <tr className="hover:bg-accent/50">
              <td className="px-4 py-2.5 text-muted-foreground font-medium">CTR</td>
              {visible.map((ad, i) => (
                <td key={i} className="px-3 py-2.5 text-center">{formatPercent(ad.ctr)}</td>
              ))}
            </tr>
            <tr className="hover:bg-accent/50">
              <td className="px-4 py-2.5 text-muted-foreground font-medium">Hook Rate</td>
              {visible.map((ad, i) => (
                <td key={i} className="px-3 py-2.5 text-center">{formatPercent(ad.hook_rate)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end px-5 py-3 border-t border-border text-xs text-muted-foreground gap-2">
          <span>{page * perPage + 1}-{Math.min((page + 1) * perPage, totalAds)}/{totalAds}</span>
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-1.5 py-0.5 rounded border border-border disabled:opacity-30 hover:bg-accent">&lt;</button>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-1.5 py-0.5 rounded border border-border disabled:opacity-30 hover:bg-accent">&gt;</button>
        </div>
      )}
    </div>
  );
}
