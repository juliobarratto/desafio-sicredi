"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/errors/api-error";
import { obterResumoDashboard } from "../services/dashboard.service";
import type { ResumoDashboard } from "../types/dashboard";
import { GraficoPrioridade } from "./grafico-prioridade";
import { GraficoStatus } from "./grafico-status";
import { IndicadorCard } from "./indicador-card";
import { SolicitacoesRecentes } from "./solicitacoes-recentes";

export function DashboardResumo() {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarResumo() {
      try {
        const dados = await obterResumoDashboard();
        if (ativo) setResumo(dados);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof ApiError
              ? error.message
              : "Não foi possível carregar os indicadores.",
          );
        }
      }
    }

    void carregarResumo();

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  function tentarNovamente() {
    setErro(null);
    setResumo(null);
    setTentativa((valorAtual) => valorAtual + 1);
  }

  if (erro) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <p role="alert" className="text-sm text-red-700">{erro}</p>
        <button
          type="button"
          onClick={tentarNovamente}
          className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!resumo) {
    return (
      <p role="status" className="mt-6 rounded-xl border border-[#e0e6de] bg-white p-5 text-sm text-[#738176]">
        Carregando indicadores...
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <IndicadorCard
            titulo="Total de solicitações"
            valor={resumo.totalSolicitacoes}
            descricao="Todas as demandas"
            destaque
          />
        </div>
        <IndicadorCard
          titulo="Abertas"
          valor={resumo.solicitacoesAbertas}
          descricao="Aguardando análise"
          corMarcador="azul"
        />
        <IndicadorCard
          titulo="Em análise"
          valor={resumo.solicitacoesEmAnalise}
          descricao="Em andamento"
          corMarcador="amarelo"
        />
        <IndicadorCard
          titulo="Aprovadas"
          valor={resumo.solicitacoesAprovadas}
          descricao="Decisão registrada"
          corMarcador="verde"
        />
        <IndicadorCard
          titulo="Rejeitadas"
          valor={resumo.solicitacoesRejeitadas}
          descricao="Decisão registrada"
          corMarcador="vermelho"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GraficoStatus resumo={resumo} />
        <GraficoPrioridade distribuicao={resumo.distribuicaoPorPrioridade} />
      </div>

      <SolicitacoesRecentes />
    </div>
  );
}
