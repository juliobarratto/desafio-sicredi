"use client";

import type { SubmitEvent } from "react";
import type { ListarSolicitacoesParams } from "../services/solicitacoes.service";
import type { Prioridade, StatusSolicitacao } from "../types/solicitacao";

export type FiltrosSolicitacoes = Pick<
  ListarSolicitacoesParams,
  "pesquisa" | "status" | "prioridade" | "ordemData"
>;

const statusPermitidos: StatusSolicitacao[] = ["ABERTA", "EM_ANALISE", "APROVADA", "REJEITADA"];
const prioridadesPermitidas: Prioridade[] = ["BAIXA", "MEDIA", "ALTA"];
const classeCampo = "mt-2 w-full min-w-0 rounded-md border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm";

export function FiltrosSolicitacoes({
  onFiltrar,
}: {
  onFiltrar: (filtros: FiltrosSolicitacoes) => void;
}) {
  function aplicarFiltros(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);
    const pesquisa = String(dados.get("pesquisa") ?? "").trim();

    onFiltrar({
      pesquisa: pesquisa || undefined,
      status: statusPermitidos.find((status) => status === dados.get("status")),
      prioridade: prioridadesPermitidas.find((prioridade) => prioridade === dados.get("prioridade")),
      ordemData: dados.get("ordemData") === "asc" ? "asc" : "desc",
    });
  }

  return (
    <form
      aria-label="Filtros de solicitações"
      onSubmit={aplicarFiltros}
      onReset={() => onFiltrar({ ordemData: "desc" })}
      className="rounded-xl border border-[var(--color-border)] bg-white p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="min-w-0 text-xs font-medium">
          Pesquisa
          <input name="pesquisa" type="search" maxLength={150} placeholder="Título, descrição, solicitante ou área" className={classeCampo} />
        </label>
        <label className="text-xs font-medium">
          Status
          <select name="status" defaultValue="" className={classeCampo}>
            <option value="">Todos os status</option>
            <option value="ABERTA">Aberta</option>
            <option value="EM_ANALISE">Em análise</option>
            <option value="APROVADA">Aprovada</option>
            <option value="REJEITADA">Rejeitada</option>
          </select>
        </label>
        <label className="text-xs font-medium">
          Prioridade
          <select name="prioridade" defaultValue="" className={classeCampo}>
            <option value="">Todas as prioridades</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
        </label>
        <label className="text-xs font-medium">
          Ordenação
          <select name="ordemData" defaultValue="desc" className={classeCampo}>
            <option value="desc">Mais recentes primeiro</option>
            <option value="asc">Mais antigas primeiro</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className="rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
          Aplicar filtros
        </button>
        <button type="reset" className="rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm hover:bg-[var(--color-soft)]">
          Limpar filtros
        </button>
      </div>
    </form>
  );
}
