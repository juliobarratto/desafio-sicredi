import Link from "next/link";
import { notFound } from "next/navigation";
import { DetalhesSolicitacao } from "@/features/solicitacoes/components/detalhes-solicitacao";

const mensagens: Record<string, string> = {
  criada: "Solicitação cadastrada com sucesso.",
  editada: "Solicitação atualizada com sucesso.",
};

export default async function DetalhesSolicitacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sucesso?: string }>;
}) {
  const [{ id }, { sucesso }] = await Promise.all([params, searchParams]);
  const idSolicitacao = Number(id);

  if (!Number.isInteger(idSolicitacao) || idSolicitacao < 1) notFound();

  return (
    <section className="space-y-6">
      <Link href="/solicitacoes" className="text-xs font-medium text-[#286046] underline-offset-4 hover:underline">
        ← Voltar para solicitações
      </Link>
      <DetalhesSolicitacao
        idSolicitacao={idSolicitacao}
        mensagemInicial={sucesso ? mensagens[sucesso] : undefined}
      />
    </section>
  );
}
