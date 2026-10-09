import { notFound } from "next/navigation";
import Link from "next/link";
import { EditarSolicitacao } from "@/features/solicitacoes/components/editar-solicitacao";

export default async function EditarSolicitacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idSolicitacao = Number(id);

  if (!Number.isInteger(idSolicitacao) || idSolicitacao < 1) notFound();

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <Link href={`/solicitacoes/${idSolicitacao}`} className="text-xs font-medium text-[#286046] underline-offset-4 hover:underline">
          ← Voltar para detalhes
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Editar solicitação</h1>
        <p className="mt-2 text-sm text-[#738176]">
          Atualize os dados cadastrais. O andamento é alterado na tela de detalhes.
        </p>
      </header>
      <EditarSolicitacao idSolicitacao={idSolicitacao} />
    </section>
  );
}
