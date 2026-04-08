"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { DATE_PRESETS } from "@/lib/constants";
import { DatePreset, DateRange } from "@/types/windsor";

interface Props {
  dateRange: DateRange;
  preset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangePicker({ dateRange, preset, onPresetChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="w-4 h-4 text-muted-foreground hidden sm:block" />
      <select
        value={preset}
        onChange={(e) => onPresetChange(e.target.value as DatePreset)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
      >
        {DATE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground hidden lg:block">
        {format(dateRange.from, "dd/MM", { locale: ptBR })} — {format(dateRange.to, "dd/MM", { locale: ptBR })}
      </span>
    </div>
  );
}
