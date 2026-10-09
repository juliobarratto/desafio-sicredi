import type { StatusSolicitacao } from "../types/solicitacao";

const apresentacaoStatus: Record<StatusSolicitacao, { nome: string; classe: string }> = {
  ABERTA: { nome: "Aberta", classe: "bg-[#edf3f9] text-[#4d7094]" },
  EM_ANALISE: { nome: "Em análise", classe: "bg-[#fff4df] text-[#97671b]" },
  APROVADA: { nome: "Aprovada", classe: "bg-[#eaf4e9] text-[#38744b]" },
  REJEITADA: { nome: "Rejeitada", classe: "bg-[#fbeeea] text-[#a05e56]" },
};

export function StatusBadge({ status }: { status: StatusSolicitacao }) {
  const apresentacao = apresentacaoStatus[status];

  return (
    <span
      className={
        "inline-flex shrink-0 items-center whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium " +
        apresentacao.classe
      }
    >
      {apresentacao.nome}
    </span>
  );
}
