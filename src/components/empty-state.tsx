import { BarChart3 } from "lucide-react";

interface Props {
  message?: string;
  action?: string;
}

export function EmptyState({ message = "Nenhum dado encontrado", action = "Altere o periodo ou verifique a conexao" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
      <p className="text-xs text-muted-foreground/60 mt-1">{action}</p>
    </div>
  );
}
