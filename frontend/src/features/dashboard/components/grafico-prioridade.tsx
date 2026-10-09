import type { Prioridade } from "@/features/solicitacoes/types/solicitacao";
import type { DistribuicaoPorPrioridade } from "../types/dashboard";

interface GraficoPrioridadeProps {
  distribuicao: DistribuicaoPorPrioridade[];
}

const prioridades: { valor: Prioridade; nome: string; cor: string }[] = [
  { valor: "BAIXA", nome: "Baixa", cor: "bg-[#b9cc9d]" },
  { valor: "MEDIA", nome: "Média", cor: "bg-[#759669]" },
  { valor: "ALTA", nome: "Alta", cor: "bg-[#185b40]" },
];

export function GraficoPrioridade({ distribuicao }: GraficoPrioridadeProps) {
  const maiorQuantidade = Math.max(1, ...distribuicao.map((item) => item.quantidade));

  return (
    <section className="rounded-xl border border-[#e0e6de] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">
        Distribuição por prioridade
      </h2>
      <p className="mt-1 text-xs text-[#738176]">
        Onde estão as demandas mais urgentes
      </p>

      <ul className="mt-3 grid grid-cols-3 gap-4">
        {prioridades.map((prioridade) => {
          const quantidade =
            distribuicao.find((item) => item.prioridade === prioridade.valor)?.quantidade ?? 0;

          return (
            <li key={prioridade.valor} className="text-center">
              <div className="flex h-36 items-end justify-center border-b border-[#e0e6de]">
                <div className="flex w-full flex-col items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums">{quantidade}</span>
                  <div
                    aria-hidden="true"
                    className={"w-2/3 max-w-16 rounded-t-md " + prioridade.cor}
                    style={{ height: (quantidade / maiorQuantidade) * 96 }}
                  />
                </div>
              </div>
              <p className="pt-3 text-xs text-[#738176]">{prioridade.nome}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
