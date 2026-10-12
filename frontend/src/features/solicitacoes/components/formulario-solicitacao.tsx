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

type CampoFormulario =
  "titulo" | "descricao" | "solicitante" | "areaSolicitante" | "prioridade";

type ErrosFormulario = Partial<Record<CampoFormulario, string>>;

const classeCampo =
  "mt-2 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm placeholder:text-[#7d8980] aria-invalid:border-red-600 aria-invalid:ring-1 aria-invalid:ring-red-600";

const prioridades: Prioridade[] = ["BAIXA", "MEDIA", "ALTA"];

function ErroCampo({
  campo,
  erros,
}: {
  campo: CampoFormulario;
  erros: ErrosFormulario;
}) {
  const mensagem = erros[campo];
  if (!mensagem) return null;

  return (
    <span
      id={`erro-${campo}`}
      className="mt-1 block text-xs font-normal text-red-700"
    >
      {mensagem}
    </span>
  );
}

export function FormularioSolicitacao(props: FormularioSolicitacaoProps) {
  const router = useRouter();
  const solicitacao = props.modo === "editar" ? props.solicitacao : null;
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<ErrosFormulario>({});
  const [tamanhoDescricao, setTamanhoDescricao] = useState(
    solicitacao?.descricao.length ?? 0,
  );

  async function salvar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    const elementoFormulario = event.currentTarget;
    const formulario = new FormData(elementoFormulario);
    const titulo = String(formulario.get("titulo") ?? "").trim();
    const descricao = String(formulario.get("descricao") ?? "").trim();
    const solicitante = String(formulario.get("solicitante") ?? "").trim();
    const areaSolicitante = String(
      formulario.get("areaSolicitante") ?? "",
    ).trim();
    const prioridadeInformada = String(formulario.get("prioridade") ?? "");
    const prioridade = prioridades.find((item) => item === prioridadeInformada);
    const novosErros: ErrosFormulario = {};

    if (!titulo) novosErros.titulo = "Informe o título.";
    if (!descricao) novosErros.descricao = "Informe a descrição.";
    if (!solicitante) novosErros.solicitante = "Informe o solicitante.";
    if (!areaSolicitante) {
      novosErros.areaSolicitante = "Informe a área solicitante.";
    }
    if (!prioridade) novosErros.prioridade = "Selecione a prioridade.";

    setErrosCampos(novosErros);
    const primeiroCampo = Object.keys(novosErros)[0] as
      CampoFormulario | undefined;
    if (primeiroCampo) {
      const elemento = elementoFormulario.elements.namedItem(primeiroCampo);
      if (elemento instanceof HTMLElement) elemento.focus();
      return;
    }

    const dados: CriarSolicitacao = {
      titulo,
      descricao,
      solicitante,
      areaSolicitante,
      prioridade: prioridade!,
    };

    setSalvando(true);
    try {
      const resposta =
        props.modo === "criar"
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
  const possuiErros = Object.keys(errosCampos).length > 0;

  return (
    <form
      noValidate
      onSubmit={salvar}
      className="space-y-6 rounded-xl border border-[var(--color-border)] bg-white p-5 sm:p-7"
    >
      {possuiErros && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Revise os campos destacados antes de continuar.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label htmlFor="titulo" className="text-sm font-medium sm:col-span-2">
          Título <span className="text-red-700">*</span>
          <input
            id="titulo"
            name="titulo"
            defaultValue={solicitacao?.titulo}
            required
            maxLength={150}
            autoFocus
            placeholder="Resuma a necessidade"
            aria-invalid={Boolean(errosCampos.titulo)}
            aria-describedby={errosCampos.titulo ? "erro-titulo" : undefined}
            className={classeCampo}
          />
          <ErroCampo campo="titulo" erros={errosCampos} />
        </label>

        <label
          htmlFor="descricao"
          className="text-sm font-medium sm:col-span-2"
        >
          Descrição <span className="text-red-700">*</span>
          <textarea
            id="descricao"
            name="descricao"
            defaultValue={solicitacao?.descricao}
            required
            maxLength={2000}
            rows={6}
            placeholder="Explique o contexto e o resultado esperado"
            aria-invalid={Boolean(errosCampos.descricao)}
            aria-describedby={
              errosCampos.descricao
                ? "erro-descricao contador-descricao"
                : "contador-descricao"
            }
            onChange={(event) => setTamanhoDescricao(event.target.value.length)}
            className={classeCampo + " resize-y"}
          />
          <span
            id="contador-descricao"
            className="mt-1 block text-right text-xs font-normal text-[var(--color-muted)]"
          >
            {tamanhoDescricao}/2000
          </span>
          <ErroCampo campo="descricao" erros={errosCampos} />
        </label>

        <label htmlFor="solicitante" className="text-sm font-medium">
          Solicitante <span className="text-red-700">*</span>
          <input
            id="solicitante"
            name="solicitante"
            defaultValue={solicitacao?.solicitante}
            required
            maxLength={150}
            placeholder="Nome de quem está solicitando"
            aria-invalid={Boolean(errosCampos.solicitante)}
            aria-describedby={
              errosCampos.solicitante ? "erro-solicitante" : undefined
            }
            className={classeCampo}
          />
          <ErroCampo campo="solicitante" erros={errosCampos} />
        </label>

        <label htmlFor="areaSolicitante" className="text-sm font-medium">
          Área solicitante <span className="text-red-700">*</span>
          <input
            id="areaSolicitante"
            name="areaSolicitante"
            defaultValue={solicitacao?.areaSolicitante}
            required
            maxLength={100}
            placeholder="Ex.: Tecnologia"
            aria-invalid={Boolean(errosCampos.areaSolicitante)}
            aria-describedby={
              errosCampos.areaSolicitante ? "erro-areaSolicitante" : undefined
            }
            className={classeCampo}
          />
          <ErroCampo campo="areaSolicitante" erros={errosCampos} />
        </label>

        <label htmlFor="prioridade" className="text-sm font-medium sm:max-w-xs">
          Prioridade <span className="text-red-700">*</span>
          <select
            id="prioridade"
            name="prioridade"
            defaultValue={solicitacao?.prioridade ?? ""}
            required
            aria-invalid={Boolean(errosCampos.prioridade)}
            aria-describedby={
              errosCampos.prioridade ? "erro-prioridade" : undefined
            }
            className={classeCampo}
          >
            <option value="" disabled>
              Selecione
            </option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
          <ErroCampo campo="prioridade" erros={errosCampos} />
        </label>
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[#e6ebe3] pt-5">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:cursor-wait disabled:opacity-60"
        >
          {salvando
            ? "Salvando..."
            : props.modo === "criar"
              ? "Cadastrar solicitação"
              : "Salvar alterações"}
        </button>
        <Link
          href={destinoCancelar}
          className="rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm hover:bg-[var(--color-soft)]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
