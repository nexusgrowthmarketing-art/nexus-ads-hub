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
  date: string;
  bar: number;
  line: number;
}

interface Props {
  data: DataPoint[];
  title: string;
  barLabel: string;
  lineLabel: string;
  barColor?: string;
  lineColor?: string;
  formatBar?: "currency" | "number";
  formatLine?: "currency" | "number";
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
          {p.name}: {typeof p.value === "number" ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function ChartCombo({
  data,
  title,
  barLabel,
  lineLabel,
  barColor = "#6B7280",
  lineColor = "#EAB308",
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-[220px] bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" vertical={false} />
          <XAxis
            dataKey="date"
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
            iconType="plainline"
            wrapperStyle={{ fontSize: 11, color: "#6B7280" }}
          />
          <Bar
            yAxisId="left"
            dataKey="bar"
            name={barLabel}
            fill={barColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            opacity={0.7}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="line"
            name={lineLabel}
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
