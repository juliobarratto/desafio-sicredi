"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError } from "@/errors/api-error";
import { StatusBadge } from "@/features/solicitacoes/components/status-badge";
import { listarSolicitacoes } from "@/features/solicitacoes/services/solicitacoes.service";
import type { Solicitacao } from "@/features/solicitacoes/types/solicitacao";

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Sao_Paulo",
});

export function SolicitacoesRecentes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarSolicitacoes() {
      try {
        const resposta = await listarSolicitacoes({
          pagina: 1,
          limite: 3,
          ordemData: "desc",
        });
        if (ativo) setSolicitacoes(resposta.dados);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof ApiError
              ? error.message
              : "Não foi possível carregar as solicitações recentes.",
          );
        }
      }
    }

    void carregarSolicitacoes();

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  function tentarNovamente() {
    setErro(null);
    setSolicitacoes(null);
    setTentativa((valorAtual) => valorAtual + 1);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      <header className="flex items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Solicitações recentes</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Últimas demandas cadastradas</p>
        </div>
        <Link
          href="/solicitacoes"
          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-xs transition-colors hover:bg-[var(--color-soft)]"
        >
          Ver todas <span aria-hidden="true">↗</span>
        </Link>
      </header>

      {erro ? (
        <div className="border-t border-[#e0e6de] p-5">
          <p role="alert" className="text-sm text-red-700">{erro}</p>
          <button
            type="button"
            onClick={tentarNovamente}
            className="mt-3 rounded-md border border-[#e0e6de] px-3 py-2 text-xs hover:bg-[#f1f5eb]"
          >
            Tentar novamente
          </button>
        </div>
      ) : solicitacoes === null ? (
        <p role="status" className="border-t border-[var(--color-border)] p-5 text-sm text-[var(--color-muted)]">
          Carregando solicitações recentes...
        </p>
      ) : solicitacoes.length === 0 ? (
        <p className="border-t border-[var(--color-border)] p-5 text-sm text-[var(--color-muted)]">
          Nenhuma solicitação cadastrada.
        </p>
      ) : (
        <ul>
          {solicitacoes.map((solicitacao) => (
            <li
              key={solicitacao.idSolicitacao}
              className="flex items-center justify-between gap-4 border-t border-[#edf0e9] px-5 py-4 sm:px-6"
            >
              <div className="min-w-0">
                <h3 className="text-xs font-medium leading-5 text-[#254e37]">
                  <Link
                    href={`/solicitacoes/${solicitacao.idSolicitacao}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {solicitacao.titulo}
                  </Link>
                </h3>
                <p className="mt-1 text-[11px] leading-5 text-[var(--color-muted)]">
                  {solicitacao.areaSolicitante}
                  {" · "}
                  <time dateTime={solicitacao.dataSolicitacao}>
                    {formatadorData.format(new Date(solicitacao.dataSolicitacao))}
                  </time>
                </p>
              </div>
              <StatusBadge status={solicitacao.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
