"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, formatCompact } from "@/lib/formatters";

interface DataPoint {
  month: string;
  meta: number;
  google: number;
  total: number;
}

interface Props {
  data: DataPoint[];
  title: string;
  metaLabel?: string;
  googleLabel?: string;
  totalLabel?: string;
  metaColor?: string;
  googleColor?: string;
  totalColor?: string;
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      {payload.map((p: { value: number; name: string; color: string }, i: number) => (
        <p key={i} className="font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export function ChartMonthly({
  data,
  title,
  metaLabel = "M: Investido",
  googleLabel = "G: Investido",
  totalLabel = "Total Investido",
  metaColor = "#6B7280",
  googleColor = "#9CA3AF",
  totalColor = "#EAB308",
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-[260px] bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => formatCompact(v)}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatCompact(v)}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="square"
            wrapperStyle={{ fontSize: 11, color: "#6B7280" }}
          />
          <Bar
            yAxisId="left"
            dataKey="meta"
            name={metaLabel}
            fill={metaColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            stackId="stack"
          />
          <Bar
            yAxisId="left"
            dataKey="google"
            name={googleLabel}
            fill={googleColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            stackId="stack"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total"
            name={totalLabel}
            stroke={totalColor}
            strokeWidth={2}
            dot={{ r: 4, fill: totalColor, stroke: "#111", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
