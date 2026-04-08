"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2, XCircle, Loader2, Wifi, Megaphone, Target, BarChart3 } from "lucide-react";

export default function SettingsPage() {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function testConnection() {
    setTesting(true);
    setStatus("idle");
    try {
      const now = new Date();
      const to = now.toISOString().split("T")[0];
      const from = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
      const res = await fetch(`/api/windsor/all?date_from=${from}&date_to=${to}`);
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <Header title="Configuracoes" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-2xl">

        {/* Aparencia */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Aparencia</h3>
          <ThemeToggle />
        </div>

        {/* API */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">API Windsor.ai</h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Conexao</span>
            </div>
            {status === "ok" && (
              <span className="flex items-center gap-1 text-xs text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Conectado
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                <XCircle className="w-3 h-3" /> Erro
              </span>
            )}
          </div>
          <button
            onClick={testConnection}
            disabled={testing}
            className="text-sm px-4 py-2 rounded-lg border border-border bg-accent hover:bg-muted transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
            Testar conexao
          </button>
        </div>

        {/* Fontes de dados */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Fontes de Dados</h3>
          <div className="space-y-3">
            {[
              { name: "Meta Ads", desc: "Instagram + Facebook", icon: Megaphone, color: "#EAB308" },
              { name: "Google Ads", desc: "Busca + Display", icon: Target, color: "#3B82F6" },
              { name: "Google Analytics 4", desc: "Trafego e comportamento", icon: BarChart3, color: "#22C55E" },
            ].map((src) => (
              <div key={src.name} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${src.color}15` }}>
                  <src.icon className="w-4 h-4" style={{ color: src.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{src.name}</p>
                  <p className="text-xs text-muted-foreground">{src.desc}</p>
                </div>
                <span className="text-[9px] bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded-full font-medium">Ativo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sobre */}
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <Image
            src="/nexus-logo-white.png"
            alt="Nexus"
            width={120}
            height={40}
            className="mx-auto mb-3 dark:block hidden"
          />
          <Image
            src="/nexus-logo-dark.png"
            alt="Nexus"
            width={120}
            height={40}
            className="mx-auto mb-3 dark:hidden block"
          />
          <p className="text-sm font-medium">Nexus Dashboard v1.0</p>
          <p className="text-xs text-muted-foreground mt-1">Nexus Digital Solutions</p>
          <p className="text-xs text-muted-foreground">Dados via Windsor.ai</p>
        </div>
      </main>
    </>
  );
}
