"use client";

import { Building2 } from "lucide-react";
import { ACCOUNTS } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (accountId: string) => void;
}

export function AccountSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-muted-foreground hidden sm:block" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
      >
        {ACCOUNTS.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.label}
          </option>
        ))}
      </select>
    </div>
  );
}
