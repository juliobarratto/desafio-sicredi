import type { Prioridade } from "../types/solicitacao";

const apresentacaoPrioridade: Record<Prioridade, { nome: string; classe: string }> = {
  BAIXA: { nome: "Baixa", classe: "bg-[#f1f5eb] text-[#637c4f]" },
  MEDIA: { nome: "Média", classe: "bg-[#fff4df] text-[#97671b]" },
  ALTA: { nome: "Alta", classe: "bg-[#fbeeea] text-[#a05e56]" },
};

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const apresentacao = apresentacaoPrioridade[prioridade];
  return (
    <span className={"inline-flex whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium " + apresentacao.classe}>
      {apresentacao.nome}
    </span>
  );
}
