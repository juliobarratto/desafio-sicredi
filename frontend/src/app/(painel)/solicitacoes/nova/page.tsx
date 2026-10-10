import Link from "next/link";
import { FormularioSolicitacao } from "@/features/solicitacoes/components/formulario-solicitacao";

export default function NovaSolicitacaoPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <Link href="/solicitacoes" className="text-xs font-medium text-[#286046] underline-offset-4 hover:underline">
          ← Voltar para solicitações
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Nova solicitação</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Registre a demanda para que ela possa ser acompanhada e analisada.
        </p>
      </header>
      <FormularioSolicitacao modo="criar" />
    </section>
  );
}
