import type { StatusSolicitacao } from "./solicitacao";

export type TipoEvento =
    | 'CRIACAO'
    | 'ALTERACAO_STATUS'
    | 'EXCLUSAO'

export interface HistoricoSolicitacao {
    idHistorico: number;
    idSolicitacao: number;
    tipoEvento: TipoEvento;
    statusAnterior: StatusSolicitacao | null;
    statusNovo: StatusSolicitacao | null;
    comentario: string | null;
    dataEvento: string;
}
