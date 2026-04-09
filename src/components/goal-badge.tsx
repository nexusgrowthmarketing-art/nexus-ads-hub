"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoalConfig } from "@/types/windsor";

interface Props {
  currentValue: number;
  goalKey: string; // unique key per account+strategy for localStorage
  loading?: boolean;
}

export function GoalBadge({ currentValue, goalKey, loading }: Props) {
  const [config, setConfig] = useState<GoalConfig>({ reference: 1, target: 1 });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`goal_${goalKey}`);
    if (stored) {
      try { setConfig(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [goalKey]);

  function save(c: GoalConfig) {
    setConfig(c);
    localStorage.setItem(`goal_${goalKey}`, JSON.stringify(c));
    setEditing(false);
  }

  if (loading) {
    return <div className="w-48 h-16 bg-muted rounded-xl animate-pulse" />;
  }

  const achieved = config.target > 0 ? (currentValue / config.target) * 100 : 0;
  const isMet = currentValue >= config.target && config.target > 0;

  return (
    <div className="relative flex items-center gap-3">
      {/* Reference & Meta */}
      <div className="flex items-center gap-4 text-xs">
        <div className="text-center">
          <p className="text-muted-foreground text-[10px] uppercase font-medium">Referencia</p>
          <p className="text-foreground font-bold text-sm">{config.reference}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground text-[10px] uppercase font-medium">Meta</p>
          <p className="text-foreground font-bold text-sm">{config.target}</p>
        </div>
      </div>

      {/* Badge */}
      <div className="flex flex-col items-end gap-1">
        <span className={cn(
          "flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
          isMet
            ? "bg-[#22C55E]/15 text-[#22C55E]"
            : "bg-primary/15 text-primary"
        )}>
          {isMet ? <Trophy className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {isMet ? "Meta Superada" : "Em Progresso"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{currentValue}</span>
          <span className={cn(
            "text-[10px] font-medium",
            isMet ? "text-[#22C55E]" : "text-primary"
          )}>
            {achieved.toFixed(1)}% Atingido
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(achieved, 100)}%`,
              backgroundColor: isMet ? "#22C55E" : "#EAB308",
            }}
          />
        </div>
      </div>

      {/* Edit button */}
      <button
        onClick={() => setEditing(!editing)}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        title="Editar meta"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>

      {/* Edit popover */}
      {editing && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl p-4 animate-fade-in w-56">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Configurar Meta</p>
          <div className="space-y-2">
            <label className="block">
              <span className="text-[10px] text-muted-foreground uppercase">Referencia</span>
              <input
                type="number"
                min="0"
                value={config.reference}
                onChange={(e) => setConfig({ ...config, reference: Math.max(0, Number(e.target.value)) })}
                className="w-full h-8 mt-1 rounded-lg border border-input bg-background px-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-muted-foreground uppercase">Meta</span>
              <input
                type="number"
                min="1"
                value={config.target}
                onChange={(e) => setConfig({ ...config, target: Math.max(1, Number(e.target.value)) })}
                className="w-full h-8 mt-1 rounded-lg border border-input bg-background px-2 text-sm"
              />
            </label>
            <button
              onClick={() => save(config)}
              className="w-full h-8 mt-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
