"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, addMonths, subMonths, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATE_PRESETS } from "@/lib/constants";
import { DatePreset, DateRange } from "@/types/windsor";

interface Props {
  dateRange: DateRange;
  preset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  onDateRangeChange: (range: DateRange) => void;
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function MiniCalendar({
  label,
  month,
  selected,
  onSelect,
  onMonthChange,
}: {
  label: string;
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="w-[220px]">
      <p className="text-[10px] text-muted-foreground uppercase font-medium mb-2">{label}</p>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onMonthChange(subMonths(month, 1))} className="p-1 hover:bg-accent rounded">
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs font-medium uppercase">
          {format(month, "MMM yyyy", { locale: ptBR })}
        </span>
        <button onClick={() => onMonthChange(addMonths(month, 1))} className="p-1 hover:bg-accent rounded">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
        ))}
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, month);
          const isSelected = isSameDay(day, selected);
          const isFuture = isAfter(day, new Date());
          return (
            <button
              key={i}
              onClick={() => !isFuture && inMonth && onSelect(day)}
              disabled={isFuture || !inMonth}
              className={cn(
                "text-center text-xs py-1.5 rounded-md transition-colors",
                !inMonth && "text-muted-foreground/30",
                inMonth && !isSelected && !isFuture && "text-foreground hover:bg-accent",
                isSelected && "bg-primary text-primary-foreground font-medium",
                isFuture && inMonth && "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({ dateRange, preset, onPresetChange, onDateRangeChange }: Props) {
  const [open, setOpen] = useState(false);
  const [fromMonth, setFromMonth] = useState(startOfMonth(dateRange.from));
  const [toMonth, setToMonth] = useState(startOfMonth(dateRange.to));
  const [tempFrom, setTempFrom] = useState(dateRange.from);
  const [tempTo, setTempTo] = useState(dateRange.to);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setTempFrom(dateRange.from);
    setTempTo(dateRange.to);
    setFromMonth(startOfMonth(dateRange.from));
    setToMonth(startOfMonth(dateRange.to));
  }, [dateRange]);

  function apply() {
    const from = tempFrom <= tempTo ? tempFrom : tempTo;
    const to = tempFrom <= tempTo ? tempTo : tempFrom;
    onDateRangeChange({ from, to });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground hover:bg-accent transition-colors"
      >
        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="hidden sm:inline text-xs">
          {format(dateRange.from, "d 'de' MMM", { locale: ptBR })} - {format(dateRange.to, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
        </span>
        <span className="sm:hidden text-xs">
          {format(dateRange.from, "dd/MM", { locale: ptBR })} - {format(dateRange.to, "dd/MM", { locale: ptBR })}
        </span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 bg-popover border border-border rounded-xl shadow-xl p-4 animate-fade-in max-h-[80vh] overflow-y-auto">
          {/* Preset selector */}
          <div className="flex items-center justify-end mb-3">
            <select
              value={preset}
              onChange={(e) => {
                onPresetChange(e.target.value as DatePreset);
                setOpen(false);
              }}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Dual calendar */}
          <div className="flex flex-col sm:flex-row gap-6">
            <MiniCalendar
              label="Data de inicio"
              month={fromMonth}
              selected={tempFrom}
              onSelect={setTempFrom}
              onMonthChange={setFromMonth}
            />
            <MiniCalendar
              label="Data de termino"
              month={toMonth}
              selected={tempTo}
              onSelect={setTempTo}
              onMonthChange={setToMonth}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={apply}
              className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
