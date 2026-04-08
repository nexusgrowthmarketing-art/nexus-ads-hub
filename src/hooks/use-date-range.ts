"use client";

import { useState, useMemo } from "react";
import { startOfDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DateRange, DatePreset } from "@/types/windsor";

function getDateRange(preset: DatePreset): DateRange {
  const now = new Date();
  const today = startOfDay(now);

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday":
      return { from: subDays(today, 1), to: subDays(today, 1) };
    case "last_7d":
      return { from: subDays(today, 6), to: today };
    case "last_14d":
      return { from: subDays(today, 13), to: today };
    case "last_30d":
      return { from: subDays(today, 29), to: today };
    case "this_month":
      return { from: startOfMonth(now), to: today };
    case "last_month": {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    default:
      return { from: subDays(today, 6), to: today };
  }
}

function getCompareRange(dateRange: DateRange): DateRange {
  const diff = dateRange.to.getTime() - dateRange.from.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  return {
    from: subDays(dateRange.from, days),
    to: subDays(dateRange.from, 1),
  };
}

export function useDateRange() {
  const [preset, setPreset] = useState<DatePreset>("last_7d");
  const [customRange, setCustomRange] = useState<DateRange | null>(null);

  const dateRange = useMemo(() => {
    if (preset === "custom" && customRange) return customRange;
    return getDateRange(preset);
  }, [preset, customRange]);

  const compareRange = useMemo(() => getCompareRange(dateRange), [dateRange]);

  function setDateRange(range: DateRange) {
    setCustomRange(range);
    setPreset("custom");
  }

  return { dateRange, setDateRange, preset, setPreset, compareRange };
}
