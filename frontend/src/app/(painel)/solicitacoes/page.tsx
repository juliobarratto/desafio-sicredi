import Link from "next/link";
import { ListaSolicitacoes } from "@/features/solicitacoes/components/lista-solicitacoes";

export default async function SolicitacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string }>;
}) {
  const { sucesso } = await searchParams;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#286046]">
            Acompanhamento das demandas
          </p>
          <h1 className="text-3xl font-bold">Solicitações</h1>
          <p className="mt-2 text-sm text-[#738176]">
            Consulte as demandas e encontre o que precisa por pesquisa, status ou prioridade.
          </p>
        </div>
        <Link
          href="/solicitacoes/nova"
          className="inline-flex min-h-10 w-fit items-center rounded-lg bg-[#185b40] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#104c33]"
        >
          Nova solicitação
        </Link>
      </header>
      {sucesso === "excluida" && (
        <p role="status" className="rounded-lg border border-[#bdd8c4] bg-[#edf7ef] px-4 py-3 text-sm text-[#286046]">
          Solicitação excluída com sucesso.
        </p>
      )}
      <ListaSolicitacoes />
    </section>
  );
}
