export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA';

export type StatusSolicitacao =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'APROVADA'
  | 'REJEITADA';

export type AlterarStatusSolicitacao =
  | {
    status: 'EM_ANALISE';
    comentario?: string;
  }
  | {
    status: 'APROVADA' | 'REJEITADA';
    comentario: string;
  }

export interface Solicitacao {
  idSolicitacao: number;
  titulo: string;
  descricao: string;
  solicitante: string;
  areaSolicitante: string;
  prioridade: Prioridade;
  status: StatusSolicitacao;
  dataSolicitacao: string;
  dataExclusao: string | null;
}

export interface CriarSolicitacao {
  titulo: string;
  descricao: string;
  solicitante: string;
  areaSolicitante: string;
  prioridade: Prioridade;
}

export interface AtualizarSolicitacao {
  titulo?: string;
  descricao?: string;
  solicitante?: string;
  areaSolicitante?: string;
  prioridade?: Prioridade;
}

export interface PaginacaoSolicitacoes {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface RespostaListarSolicitacoes {
  dados: Solicitacao[];
  paginacao: PaginacaoSolicitacoes;
}
