"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCompact, formatCurrency } from "@/lib/formatters";

interface DataItem {
  name: string;
  value: number;
}

interface Props {
  data: DataItem[];
  title: string;
  horizontal?: boolean;
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-foreground font-medium">{payload[0].payload.name}</p>
      <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function ChartBar({ data, title, horizontal, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-[250px] bg-muted rounded" />
      </div>
    );
  }

  const height = horizontal ? Math.max(200, data.length * 40) : 250;

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 4, left: horizontal ? 4 : -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" horizontal={!horizontal} vertical={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tickFormatter={formatCompact} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={120} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatCompact} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(0 0% 12%)" }} />
          <Bar dataKey="value" fill="#EAB308" radius={[4, 4, 4, 4]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
