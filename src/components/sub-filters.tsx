"use client";

import { Layers, LayoutGrid, FileText, Search } from "lucide-react";

interface Props {
  campaigns: string[];
  adsets?: string[];
  ads?: string[];
  keywords?: string[];
  selectedCampaign: string;
  selectedAdset: string;
  selectedAd: string;
  selectedKeyword?: string;
  onCampaignChange: (v: string) => void;
  onAdsetChange: (v: string) => void;
  onAdChange: (v: string) => void;
  onKeywordChange?: (v: string) => void;
  showKeyword?: boolean;
}

export function SubFilters({
  campaigns,
  adsets,
  ads,
  keywords,
  selectedCampaign,
  selectedAdset,
  selectedAd,
  selectedKeyword,
  onCampaignChange,
  onAdsetChange,
  onAdChange,
  onKeywordChange,
  showKeyword,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        icon={<Layers className="w-3.5 h-3.5" />}
        label="Campanha"
        value={selectedCampaign}
        options={campaigns}
        onChange={onCampaignChange}
      />
      <FilterSelect
        icon={<LayoutGrid className="w-3.5 h-3.5" />}
        label={showKeyword ? "Grupo de Anuncios" : "Conjunto de Anuncios"}
        value={selectedAdset}
        options={adsets ?? []}
        onChange={onAdsetChange}
      />
      <FilterSelect
        icon={<FileText className="w-3.5 h-3.5" />}
        label={showKeyword ? "Palavra-Chave" : "Anuncio"}
        value={showKeyword ? (selectedKeyword ?? "") : selectedAd}
        options={showKeyword ? (keywords ?? []) : (ads ?? [])}
        onChange={showKeyword ? (onKeywordChange ?? (() => {})) : onAdChange}
      />
      {showKeyword && (
        <FilterSelect
          icon={<Search className="w-3.5 h-3.5" />}
          label="Anuncio"
          value={selectedAd}
          options={ads ?? []}
          onChange={onAdChange}
        />
      )}
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground min-w-[120px] max-w-[180px] truncate"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.length > 30 ? opt.substring(0, 30) + "..." : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
