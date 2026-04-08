"use client";

import { RefreshCw, Clock } from "lucide-react";

interface Props {
  title: string;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

export function Header({ title, lastUpdated, onRefresh }: Props) {
  const timeAgo = lastUpdated
    ? `${Math.round((Date.now() - lastUpdated.getTime()) / 60000)} min`
    : null;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6 h-16">
      <div className="flex-1 ml-10 md:ml-0">
        <h1 className="text-lg font-semibold tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {timeAgo && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
