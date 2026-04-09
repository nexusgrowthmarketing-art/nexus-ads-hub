"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { STRATEGIES } from "@/lib/constants";
import { Strategy } from "@/types/windsor";

interface Props {
  selected: Strategy[];
  onChange: (strategies: Strategy[]) => void;
}

export function StrategyFilter({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(strategy: Strategy) {
    if (selected.includes(strategy)) {
      onChange(selected.filter((s) => s !== strategy));
    } else {
      onChange([...selected, strategy]);
    }
  }

  const label = selected.length === 0
    ? "Estrategia"
    : selected.length === 1
      ? `Estrategia: ${STRATEGIES.find((s) => s.value === selected[0])?.label}`
      : `Estrategia (${selected.length})`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors",
          selected.length > 0
            ? "border-primary/50 bg-primary/5 text-foreground"
            : "border-input bg-background text-muted-foreground hover:text-foreground"
        )}
      >
        <Crosshair className="w-3.5 h-3.5" />
        <span className="truncate max-w-[160px]">{label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-56 bg-popover border border-border rounded-xl shadow-xl p-1 animate-fade-in">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary px-3 py-2">
            Estrategia ({selected.length})
          </p>
          {STRATEGIES.map((s) => {
            const checked = selected.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => toggle(s.value)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
              >
                <span className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center text-[10px]",
                  checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                )}>
                  {checked && <Check className="w-3 h-3" />}
                </span>
                <span className={checked ? "text-foreground" : "text-muted-foreground"}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
