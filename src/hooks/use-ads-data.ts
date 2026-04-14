"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { DateRange } from "@/types/ads";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Map legacy Windsor endpoint names to new /api/data/* routes
const ENDPOINT_MAP: Record<string, string> = {
  meta: "meta",
  "google-ads": "google-ads",
  analytics: "analytics",
  all: "all",
};

export function useAdsData<T>(endpoint: string, dateRange: DateRange | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!dateRange) return;
    setIsLoading(true);
    setError(null);

    const resolved = ENDPOINT_MAP[endpoint] ?? endpoint;

    const params = new URLSearchParams({
      date_from: format(dateRange.from, "yyyy-MM-dd"),
      date_to: format(dateRange.to, "yyyy-MM-dd"),
    });

    try {
      const res = await fetch(`/api/data/${resolved}?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar dados");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, dateRange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData, lastUpdated };
}
