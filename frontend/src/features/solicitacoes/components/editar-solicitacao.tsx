"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError } from "@/errors/api-error";
import { buscarSolicitacao } from "../services/solicitacoes.service";
import type { Solicitacao } from "../types/solicitacao";
import { FormularioSolicitacao } from "./formulario-solicitacao";

export function EditarSolicitacao({ idSolicitacao }: { idSolicitacao: number }) {
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      try {
        const dados = await buscarSolicitacao(idSolicitacao, controlador.signal);
        if (!controlador.signal.aborted) setSolicitacao(dados);
      } catch (error) {
        if (!controlador.signal.aborted) {
          setErro(
            error instanceof ApiError
              ? error.message
              : "Não foi possível carregar a solicitação.",
          );
        }
      }
    }

    void carregar();
    return () => controlador.abort();
  }, [idSolicitacao, tentativa]);

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p role="alert" className="text-sm text-red-700">{erro}</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setErro(null);
              setSolicitacao(null);
              setTentativa((atual) => atual + 1);
            }}
            className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm text-red-700"
          >
            Tentar novamente
          </button>
          <Link href="/solicitacoes" className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm text-red-700">
            Voltar à lista
          </Link>
        </div>
      </div>
    );
  }

  if (!solicitacao) {
    return <p role="status" className="rounded-xl border border-[#e0e6de] bg-white p-5 text-sm text-[#738176]">Carregando solicitação...</p>;
  }

  return <FormularioSolicitacao modo="editar" solicitacao={solicitacao} />;
}
