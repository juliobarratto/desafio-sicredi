"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";

import { ApiError } from "@/errors/api-error";
import {
  alterarStatusSolicitacao,
  buscarHistoricoSolicitacao,
  buscarSolicitacao,
  excluirSolicitacao,
} from "../services/solicitacoes.service";
import type { HistoricoSolicitacao } from "../types/historico-solicitacao";
import type {
  AlterarStatusSolicitacao,
  Solicitacao,
  StatusSolicitacao,
} from "../types/solicitacao";
import { PrioridadeBadge } from "./prioridade-badge";
import { StatusBadge } from "./status-badge";

interface DadosDetalhes {
  solicitacao: Solicitacao;
  historico: HistoricoSolicitacao[];
}

type Decisao = "APROVADA" | "REJEITADA";

const nomesStatus: Record<StatusSolicitacao, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em análise",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};

const nomesEvento = {
  CRIACAO: "Solicitação criada",
  ALTERACAO_STATUS: "Status alterado",
  EXCLUSAO: "Solicitação excluída",
} as const;

const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function DetalhesSolicitacao({
  idSolicitacao,
  mensagemInicial,
}: {
  idSolicitacao: number;
  mensagemInicial?: string;
}) {
  const router = useRouter();
  const [dados, setDados] = useState<DadosDetalhes | null>(null);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(mensagemInicial ?? null);
  const [tentativa, setTentativa] = useState(0);
  const [processando, setProcessando] = useState<"status" | "excluir" | null>(null);
  const [decisao, setDecisao] = useState<Decisao | null>(null);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      try {
        const [solicitacao, historico] = await Promise.all([
          buscarSolicitacao(idSolicitacao, controlador.signal),
          buscarHistoricoSolicitacao(idSolicitacao, controlador.signal),
        ]);
        if (!controlador.signal.aborted) {
          setDados({ solicitacao, historico });
        }
      } catch (error) {
        if (!controlador.signal.aborted) {
          setErroCarregamento(
            error instanceof ApiError
              ? error.message
              : "Não foi possível carregar os detalhes da solicitação.",
          );
        }
      }
    }

    void carregar();
    return () => controlador.abort();
  }, [idSolicitacao, tentativa]);

  function recarregar() {
    setDados(null);
    setErroCarregamento(null);
    setTentativa((atual) => atual + 1);
  }

  async function executarAlteracaoStatus(
    alteracao: AlterarStatusSolicitacao,
    mensagemSucesso: string,
  ) {
    setProcessando("status");
    setErroAcao(null);
    try {
      await alterarStatusSolicitacao(idSolicitacao, alteracao);
      setMensagem(mensagemSucesso);
      setDecisao(null);
      setComentario("");
      recarregar();
    } catch (error) {
      setErroAcao(
        error instanceof ApiError
          ? error.message
          : "Não foi possível alterar o status.",
      );
    } finally {
      setProcessando(null);
    }
  }

  function concluirDecisao(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decisao) return;

    const comentarioNormalizado = comentario.trim();
    if (!comentarioNormalizado) {
      setErroAcao("Informe o comentário da decisão.");
      return;
    }

    void executarAlteracaoStatus(
      { status: decisao, comentario: comentarioNormalizado },
      decisao === "APROVADA"
        ? "Solicitação aprovada com sucesso."
        : "Solicitação rejeitada com sucesso.",
    );
  }

  async function excluir() {
    const confirmou = window.confirm(
      "Deseja excluir esta solicitação? Ela deixará de aparecer nas consultas.",
    );
    if (!confirmou) return;

    setProcessando("excluir");
    setErroAcao(null);
    try {
      await excluirSolicitacao(idSolicitacao);
      router.push("/solicitacoes?sucesso=excluida");
      router.refresh();
    } catch (error) {
      setErroAcao(
        error instanceof ApiError
          ? error.message
          : "Não foi possível excluir a solicitação.",
      );
      setProcessando(null);
    }
  }

  if (erroCarregamento) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p role="alert" className="text-sm text-red-700">{erroCarregamento}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={recarregar} className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm text-red-700">
            Tentar novamente
          </button>
          <Link href="/solicitacoes" className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm text-red-700">
            Voltar à lista
          </Link>
        </div>
      </section>
    );
  }

  if (!dados) {
    return <p role="status" className="rounded-xl border border-[#e0e6de] bg-white p-5 text-sm text-[#738176]">Carregando detalhes e histórico...</p>;
  }

  const { solicitacao, historico } = dados;

  return (
    <div className="space-y-5">
      {mensagem && (
        <p role="status" className="rounded-lg border border-[#bdd8c4] bg-[#edf7ef] px-4 py-3 text-sm text-[#286046]">
          {mensagem}
        </p>
      )}
      {erroAcao && !decisao && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroAcao}
        </p>
      )}

      <section className="rounded-xl border border-[#e0e6de] bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={solicitacao.status} />
              <PrioridadeBadge prioridade={solicitacao.prioridade} />
            </div>
            <h1 className="mt-4 wrap-break-word text-2xl font-bold sm:text-3xl">{solicitacao.titulo}</h1>
            <p className="mt-2 text-xs text-[#738176]">Solicitação #{solicitacao.idSolicitacao}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/solicitacoes/${idSolicitacao}/editar`}
              className="rounded-md border border-[#dce4d9] px-4 py-2 text-sm hover:bg-[#f1f5eb]"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={() => void excluir()}
              disabled={processando !== null}
              className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {processando === "excluir" ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>

        <dl className="mt-7 grid gap-5 border-t border-[#edf0e9] pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-[#738176]">Solicitante</dt>
            <dd className="mt-1 wrap-break-word text-sm font-medium">{solicitacao.solicitante}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#738176]">Área</dt>
            <dd className="mt-1 wrap-break-word text-sm font-medium">{solicitacao.areaSolicitante}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#738176]">Data da solicitação</dt>
            <dd className="mt-1 text-sm font-medium">
              <time dateTime={solicitacao.dataSolicitacao}>
                {formatadorDataHora.format(new Date(solicitacao.dataSolicitacao))}
              </time>
            </dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-xs text-[#738176]">Descrição</dt>
            <dd className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6">{solicitacao.descricao}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-[#e0e6de] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Próxima ação</h2>
        {solicitacao.status === "ABERTA" && (
          <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#738176]">Envie a solicitação para análise quando o atendimento começar.</p>
            <button
              type="button"
              disabled={processando !== null}
              onClick={() => void executarAlteracaoStatus(
                { status: "EM_ANALISE" },
                "Análise iniciada com sucesso.",
              )}
              className="rounded-md bg-[#195b40] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#124b33] disabled:opacity-50"
            >
              {processando === "status" ? "Atualizando..." : "Iniciar análise"}
            </button>
          </div>
        )}
        {solicitacao.status === "EM_ANALISE" && (
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#738176]">Registre a decisão e seu comentário obrigatório.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setDecisao("APROVADA");
                  setErroAcao(null);
                }}
                className="rounded-md bg-[#195b40] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#124b33]"
              >
                Aprovar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecisao("REJEITADA");
                  setErroAcao(null);
                }}
                className="rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Rejeitar
              </button>
            </div>
          </div>
        )}
        {(solicitacao.status === "APROVADA" || solicitacao.status === "REJEITADA") && (
          <p className="mt-3 text-sm text-[#738176]">
            Esta solicitação possui uma decisão final e não aceita novas mudanças de status.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e0e6de] bg-white">
        <header className="p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Histórico</h2>
          <p className="mt-1 text-xs text-[#738176]">Eventos registrados em ordem cronológica.</p>
        </header>
        {historico.length === 0 ? (
          <p className="border-t border-[#edf0e9] p-5 text-sm text-[#738176]">Nenhum evento registrado.</p>
        ) : (
          <ol className="divide-y divide-[#edf0e9] border-t border-[#edf0e9]">
            {historico.map((evento) => (
              <li key={evento.idHistorico} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:px-7">
                <div>
                  <h3 className="text-sm font-medium">{nomesEvento[evento.tipoEvento]}</h3>
                  {evento.statusNovo && (
                    <p className="mt-1 text-xs text-[#738176]">
                      {evento.statusAnterior
                        ? `${nomesStatus[evento.statusAnterior]} → ${nomesStatus[evento.statusNovo]}`
                        : `Status inicial: ${nomesStatus[evento.statusNovo]}`}
                    </p>
                  )}
                  {evento.comentario && (
                    <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6">{evento.comentario}</p>
                  )}
                </div>
                <time dateTime={evento.dataEvento} className="text-xs text-[#738176]">
                  {formatadorDataHora.format(new Date(evento.dataEvento))}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>

      {decisao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-decisao" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 id="titulo-decisao" className="text-xl font-semibold">
              {decisao === "APROVADA" ? "Aprovar solicitação" : "Rejeitar solicitação"}
            </h2>
            <p className="mt-2 text-sm text-[#738176]">Explique o motivo da decisão. Esse comentário ficará no histórico.</p>
            <form onSubmit={concluirDecisao} className="mt-5">
              <label className="text-sm font-medium">
                Comentário <span className="text-red-700">*</span>
                <textarea
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                  autoFocus
                  required
                  rows={5}
                  className="mt-2 w-full resize-y rounded-md border border-[#dce4d9] px-3 py-2.5 text-sm"
                />
              </label>
              {erroAcao && (
                <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erroAcao}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={processando !== null}
                  className={
                    "rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 " +
                    (decisao === "APROVADA" ? "bg-[#195b40] hover:bg-[#124b33]" : "bg-red-700 hover:bg-red-800")
                  }
                >
                  {processando === "status" ? "Registrando..." : "Confirmar decisão"}
                </button>
                <button
                  type="button"
                  disabled={processando !== null}
                  onClick={() => {
                    setDecisao(null);
                    setComentario("");
                    setErroAcao(null);
                  }}
                  className="rounded-md border border-[#dce4d9] px-4 py-2.5 text-sm hover:bg-[#f1f5eb]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
