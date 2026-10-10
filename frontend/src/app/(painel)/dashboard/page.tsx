import Link from "next/link";
import { DashboardResumo } from "@/features/dashboard/components/dashboard-resumo";

export default function DashboardPage() {
  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#185b40] uppercase">
            Acompanhamento da operação
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Visão geral
          </h1>
          <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
            O que entrou, o que está em análise e o que já foi decidido.
          </p>
        </div>

        <Link
          href="/solicitacoes"
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg bg-[#185b40] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#104c33]"
        >
          Gerenciar solicitações <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <DashboardResumo />
    </section>
  );
}
