"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";

import { ApiError } from "@/errors/api-error";
import {
  atualizarSolicitacao,
  criarSolicitacao,
} from "../services/solicitacoes.service";
import type {
  CriarSolicitacao,
  Prioridade,
  Solicitacao,
} from "../types/solicitacao";

type FormularioSolicitacaoProps =
  | { modo: "criar"; solicitacao?: never }
  | { modo: "editar"; solicitacao: Solicitacao };

const classeCampo =
  "mt-2 w-full rounded-md border border-[#dce4d9] bg-white px-3 py-2.5 text-sm placeholder:text-[#97a199]";

const prioridades: Prioridade[] = ["BAIXA", "MEDIA", "ALTA"];

export function FormularioSolicitacao(props: FormularioSolicitacaoProps) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const solicitacao = props.modo === "editar" ? props.solicitacao : null;

  async function salvar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    const formulario = new FormData(event.currentTarget);
    const titulo = String(formulario.get("titulo") ?? "").trim();
    const descricao = String(formulario.get("descricao") ?? "").trim();
    const solicitante = String(formulario.get("solicitante") ?? "").trim();
    const areaSolicitante = String(formulario.get("areaSolicitante") ?? "").trim();
    const prioridadeInformada = String(formulario.get("prioridade") ?? "");
    const prioridade = prioridades.find((item) => item === prioridadeInformada);

    if (!titulo || !descricao || !solicitante || !areaSolicitante || !prioridade) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    const dados: CriarSolicitacao = {
      titulo,
      descricao,
      solicitante,
      areaSolicitante,
      prioridade,
    };

    setSalvando(true);
    try {
      const resposta = props.modo === "criar"
        ? await criarSolicitacao(dados)
        : await atualizarSolicitacao(props.solicitacao.idSolicitacao, dados);

      const sucesso = props.modo === "criar" ? "criada" : "editada";
      router.push(`/solicitacoes/${resposta.idSolicitacao}?sucesso=${sucesso}`);
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar a solicitação.",
      );
      setSalvando(false);
    }
  }

  const destinoCancelar = solicitacao
    ? `/solicitacoes/${solicitacao.idSolicitacao}`
    : "/solicitacoes";

  return (
    <form
      onSubmit={salvar}
      className="space-y-6 rounded-xl border border-[#e0e6de] bg-white p-5 sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">
          Título <span className="text-red-700">*</span>
          <input
            name="titulo"
            defaultValue={solicitacao?.titulo}
            required
            maxLength={150}
            autoFocus
            placeholder="Resuma a necessidade"
            className={classeCampo}
          />
        </label>

        <label className="text-sm font-medium sm:col-span-2">
          Descrição <span className="text-red-700">*</span>
          <textarea
            name="descricao"
            defaultValue={solicitacao?.descricao}
            required
            rows={6}
            placeholder="Explique o contexto e o resultado esperado"
            className={classeCampo + " resize-y"}
          />
        </label>

        <label className="text-sm font-medium">
          Solicitante <span className="text-red-700">*</span>
          <input
            name="solicitante"
            defaultValue={solicitacao?.solicitante}
            required
            maxLength={150}
            placeholder="Nome de quem está solicitando"
            className={classeCampo}
          />
        </label>

        <label className="text-sm font-medium">
          Área solicitante <span className="text-red-700">*</span>
          <input
            name="areaSolicitante"
            defaultValue={solicitacao?.areaSolicitante}
            required
            maxLength={100}
            placeholder="Ex.: Tecnologia"
            className={classeCampo}
          />
        </label>

        <label className="text-sm font-medium sm:max-w-xs">
          Prioridade <span className="text-red-700">*</span>
          <select
            name="prioridade"
            defaultValue={solicitacao?.prioridade ?? ""}
            required
            className={classeCampo}
          >
            <option value="" disabled>Selecione</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
        </label>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[#edf0e9] pt-5">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-md bg-[#195b40] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#124b33] disabled:cursor-wait disabled:opacity-60"
        >
          {salvando
            ? "Salvando..."
            : props.modo === "criar"
              ? "Cadastrar solicitação"
              : "Salvar alterações"}
        </button>
        <Link
          href={destinoCancelar}
          className="rounded-md border border-[#dce4d9] px-5 py-2.5 text-sm hover:bg-[#f1f5eb]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
