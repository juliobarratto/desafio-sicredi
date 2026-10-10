"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/errors/api-error";
import { listarSolicitacoes } from "../services/solicitacoes.service";
import type { ListarSolicitacoesParams } from "../services/solicitacoes.service";
import type { RespostaListarSolicitacoes } from "../types/solicitacao";
import { FiltrosSolicitacoes } from "./filtros-solicitacoes";
import type { FiltrosSolicitacoes as ValoresFiltros } from "./filtros-solicitacoes";
import { TabelaSolicitacoes } from "./tabela-solicitacoes";

interface Consulta {
  parametros: ListarSolicitacoesParams & { pagina: number; limite: number };
  tentativa: number;
}

type ResultadoConsulta =
  | { consulta: Consulta; resposta: RespostaListarSolicitacoes; erro?: never }
  | { consulta: Consulta; erro: string; resposta?: never };

const classeBotao = "rounded-md border border-[var(--color-border)] px-3 py-2 text-xs hover:bg-[var(--color-soft)] disabled:cursor-not-allowed disabled:opacity-40";

export function ListaSolicitacoes() {
  const [consulta, setConsulta] = useState<Consulta>({
    parametros: { pagina: 1, limite: 10, ordemData: "desc" },
    tentativa: 0,
  });
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);

  // Só mostramos o resultado que pertence aos filtros e à página atuais.
  const resultadoAtual = resultado?.consulta === consulta ? resultado : null;
  const carregando = resultadoAtual === null;
  const resposta = resultadoAtual?.resposta;
  const erro = resultadoAtual?.erro;

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      try {
        const resposta = await listarSolicitacoes(consulta.parametros, controlador.signal);
        if (controlador.signal.aborted) return;

        // Se registros desaparecerem entre consultas, voltamos a uma página válida.
        const ultimaPagina = Math.max(1, resposta.paginacao.totalPaginas);
        if (consulta.parametros.pagina > ultimaPagina) {
          setConsulta((atual) => atual === consulta
            ? { ...atual, parametros: { ...atual.parametros, pagina: ultimaPagina } }
            : atual);
          return;
        }
        setResultado({ consulta, resposta });
      } catch (error) {
        if (controlador.signal.aborted) return;
        setResultado({
          consulta,
          erro: error instanceof ApiError ? error.message : "Não foi possível carregar as solicitações.",
        });
      }
    }

    void carregar();
    return () => controlador.abort();
  }, [consulta]);

  function aplicarFiltros(filtros: ValoresFiltros) {
    setConsulta((atual) => ({
      ...atual,
      parametros: { ...filtros, pagina: 1, limite: atual.parametros.limite },
    }));
  }

  function mudarPagina(pagina: number) {
    setConsulta((atual) => ({ ...atual, parametros: { ...atual.parametros, pagina } }));
  }

  const total = resposta?.paginacao.total ?? 0;
  const inicio = resposta && resposta.dados.length > 0
    ? (resposta.paginacao.pagina - 1) * resposta.paginacao.limite + 1
    : 0;
  const fim = resposta ? inicio + resposta.dados.length - (inicio > 0 ? 1 : 0) : 0;

  return (
    <div className="space-y-5">
      <FiltrosSolicitacoes onFiltrar={aplicarFiltros} />
      <section aria-label="Resultado da consulta" aria-busy={carregando} className="min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <header className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Solicitações encontradas</h2>
            <p aria-live="polite" className="mt-1 text-xs text-[var(--color-muted)]">
              {carregando ? "Buscando demandas..." : erro ? "Consulta indisponível" : `${total} ${total === 1 ? "solicitação encontrada" : "solicitações encontradas"}`}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            Por página
            <select
              aria-label="Solicitações por página"
              value={consulta.parametros.limite}
              onChange={(event) => {
                const limite = Number(event.target.value);
                setConsulta((atual) => ({ ...atual, parametros: { ...atual.parametros, limite, pagina: 1 } }));
              }}
              className="rounded-md border border-[var(--color-border)] bg-white px-2 py-2 text-sm text-[#20382c]"
            >
              <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
          </label>
        </header>

        {carregando ? (
          <p role="status" className="border-t border-[var(--color-border)] p-8 text-sm text-[var(--color-muted)]">Carregando solicitações...</p>
        ) : erro ? (
          <div className="border-t border-[var(--color-border)] p-6">
            <p role="alert" className="text-sm text-red-700">{erro}</p>
            <button type="button" onClick={() => setConsulta((atual) => ({ ...atual, tentativa: atual.tentativa + 1 }))} className={classeBotao + " mt-4"}>
              Tentar novamente
            </button>
          </div>
        ) : resposta && resposta.dados.length > 0 ? (
          <TabelaSolicitacoes solicitacoes={resposta.dados} />
        ) : (
          <div className="border-t border-[var(--color-border)] p-8 text-center">
            <h3 className="text-sm font-medium">Nenhuma solicitação encontrada</h3>
            <p className="mt-2 text-xs text-[var(--color-muted)]">Ainda não há registros ou nenhum corresponde aos filtros aplicados.</p>
          </div>
        )}

        {resposta && (
          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] p-5 text-xs text-[var(--color-muted)]">
            <p>{total > 0 ? `Mostrando ${inicio}–${fim} de ${total}` : "Nenhum registro para exibir"}</p>
            <nav aria-label="Paginação de solicitações" className="flex flex-wrap items-center gap-3">
              <button type="button" className={classeBotao} disabled={resposta.paginacao.pagina <= 1} onClick={() => mudarPagina(resposta.paginacao.pagina - 1)}>Anterior</button>
              <span>{total > 0 ? `Página ${resposta.paginacao.pagina} de ${resposta.paginacao.totalPaginas}` : "Sem páginas"}</span>
              <button type="button" className={classeBotao} disabled={resposta.paginacao.pagina >= resposta.paginacao.totalPaginas} onClick={() => mudarPagina(resposta.paginacao.pagina + 1)}>Próxima</button>
            </nav>
          </footer>
        )}
      </section>
    </div>
  );
}
