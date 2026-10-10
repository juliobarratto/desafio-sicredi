import type { ResumoDashboard } from "../types/dashboard";

interface GraficoStatusProps {
  resumo: ResumoDashboard;
}

export function GraficoStatus({ resumo }: GraficoStatusProps) {
  const indicadores = [
    { nome: "Aberta", quantidade: resumo.solicitacoesAbertas, cor: "bg-[#568368]" },
    { nome: "Em análise", quantidade: resumo.solicitacoesEmAnalise, cor: "bg-[#c6aa67]" },
    { nome: "Aprovada", quantidade: resumo.solicitacoesAprovadas, cor: "bg-[#4c875b]" },
    { nome: "Rejeitada", quantidade: resumo.solicitacoesRejeitadas, cor: "bg-[#c88371]" },
  ];

  // Todas as barras usam a mesma escala, baseada no maior valor.
  const maiorQuantidade = Math.max(1, ...indicadores.map((item) => item.quantidade));

  return (
    <section className="rounded-xl border border-[#e0e6de] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">
        Andamento das solicitações
      </h2>
      <p className="mt-1 text-xs text-[var(--color-muted)]">Quantidade por status</p>

      <ul className="mt-7 space-y-4">
        {indicadores.map((item) => (
          <li key={item.nome} className="grid grid-cols-[5rem_minmax(0,1fr)_1.5rem] items-center gap-3 text-xs">
            <span>{item.nome}</span>
            <div aria-hidden="true" className="h-5 overflow-hidden rounded bg-[#f1f4ed]">
              <div
                className={"h-full rounded " + item.cor}
                style={{ width: (item.quantidade / maiorQuantidade) * 100 + "%" }}
              />
            </div>
            <span className="text-right font-semibold tabular-nums">{item.quantidade}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
