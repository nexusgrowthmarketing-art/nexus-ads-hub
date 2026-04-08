import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
      <Image
        src="/nexus-icon-white.png"
        alt="Nexus"
        width={48}
        height={48}
        className="mb-6 opacity-30 dark:block hidden"
      />
      <Image
        src="/nexus-icon-dark.png"
        alt="Nexus"
        width={48}
        height={48}
        className="mb-6 opacity-30 dark:hidden block"
      />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Pagina nao encontrada</p>
      <Link
        href="/dashboard"
        className="text-sm text-primary hover:underline"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
