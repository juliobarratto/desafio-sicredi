import Link from "next/link";
import type { Solicitacao } from "../types/solicitacao";
import { PrioridadeBadge } from "./prioridade-badge";
import { StatusBadge } from "./status-badge";

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

function DataSolicitacao({ data }: { data: string }) {
  return <time dateTime={data}>{formatadorData.format(new Date(data))}</time>;
}

export function TabelaSolicitacoes({ solicitacoes }: { solicitacoes: Solicitacao[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Solicitações encontradas na página atual</caption>
          <thead className="border-y border-[#e0e6de] bg-[#f8faf6] text-xs text-[#738176]">
            <tr>
              {["Solicitação", "Área", "Prioridade", "Status", "Data"].map((coluna) => (
                <th key={coluna} scope="col" className="px-5 py-3 font-medium">{coluna}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {solicitacoes.map((solicitacao) => (
              <tr key={solicitacao.idSolicitacao} className="border-b border-[#edf0e9] last:border-b-0 hover:bg-[#fafcf8]">
                <td className="max-w-80 break-words px-5 py-4">
                  <Link
                    href={`/solicitacoes/${solicitacao.idSolicitacao}`}
                    className="font-medium text-[#254e37] underline-offset-4 hover:underline"
                  >
                    {solicitacao.titulo}
                  </Link>
                  <p className="mt-1 text-xs text-[#738176]">#{solicitacao.idSolicitacao} · {solicitacao.solicitante}</p>
                </td>
                <td className="max-w-48 break-words px-5 py-4">{solicitacao.areaSolicitante}</td>
                <td className="px-5 py-4"><PrioridadeBadge prioridade={solicitacao.prioridade} /></td>
                <td className="px-5 py-4"><StatusBadge status={solicitacao.status} /></td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-[#738176]"><DataSolicitacao data={solicitacao.dataSolicitacao} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label="Solicitações encontradas" className="divide-y divide-[#edf0e9] border-t border-[#e0e6de] md:hidden">
        {solicitacoes.map((solicitacao) => (
          <li key={solicitacao.idSolicitacao} className="space-y-3 p-5">
            <div className="break-words">
              <h3 className="text-sm font-medium text-[#254e37]">
                <Link
                  href={`/solicitacoes/${solicitacao.idSolicitacao}`}
                  className="underline-offset-4 hover:underline"
                >
                  {solicitacao.titulo}
                </Link>
              </h3>
              <p className="mt-1 text-xs text-[#738176]">#{solicitacao.idSolicitacao} · {solicitacao.solicitante}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={solicitacao.status} />
              <PrioridadeBadge prioridade={solicitacao.prioridade} />
            </div>
            <dl className="space-y-1 text-xs text-[#738176]">
              <div className="flex gap-2"><dt>Área:</dt><dd className="min-w-0 break-words">{solicitacao.areaSolicitante}</dd></div>
              <div className="flex gap-2"><dt>Data:</dt><dd><DataSolicitacao data={solicitacao.dataSolicitacao} /></dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
