"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface DataItem {
  name: string;
  value: number;
}

interface Props {
  data: DataItem[];
  title: string;
  total?: number;
  loading?: boolean;
}

const COLORS = ["#EAB308", "#6B7280", "#3B82F6", "#22C55E", "#EF4444"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-foreground font-medium">{payload[0].name}</p>
      <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function ChartDonut({ data, title, total, loading }: Props) {
  const computedTotal = total ?? data.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />
        <div className="h-[200px] bg-muted rounded-full mx-auto w-[200px]" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-lg font-bold">{formatCurrency(computedTotal)}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
