import { api } from '@/lib/api';
import type {
    AlterarStatusSolicitacao,
    AtualizarSolicitacao,
    CriarSolicitacao,
    Prioridade,
    RespostaListarSolicitacoes,
    Solicitacao,
    StatusSolicitacao,
} from '@/features/solicitacoes/types/solicitacao';
import type { HistoricoSolicitacao } from '@/features/solicitacoes/types/historico-solicitacao';

export interface ListarSolicitacoesParams {
    pesquisa?: string;
    status?: StatusSolicitacao;
    prioridade?: Prioridade;
    ordemData?: 'asc' | 'desc';
    pagina?: number;
    limite?: number;
}

export function listarSolicitacoes(
  params?: ListarSolicitacoesParams,
  signal?: AbortSignal,
) {
  return api.get<RespostaListarSolicitacoes>(
    '/solicitacoes',
    {
      params,
      signal,
    },
  );
}

export function buscarSolicitacao(
    idSolicitacao: number,
    signal?: AbortSignal,
) {
    return api.get<Solicitacao>(
        `/solicitacoes/${idSolicitacao}`,
        { signal },
    );
}

export function criarSolicitacao(
    dados: CriarSolicitacao,
) {
    return api.post<Solicitacao>(
        '/solicitacoes',
        dados,
    );
}

export function atualizarSolicitacao(
    idSolicitacao: number,
    dados: AtualizarSolicitacao,
) {
    return api.patch<Solicitacao>(
        `/solicitacoes/${idSolicitacao}`,
        dados,
    );
}

export function excluirSolicitacao(
    idSolicitacao: number,
) {
    return api.delete<void>(
        `/solicitacoes/${idSolicitacao}`,
    );
}

export function alterarStatusSolicitacao(
    idSolicitacao: number,
    dados: AlterarStatusSolicitacao,
) {
    return api.patch<Solicitacao>(
        `/solicitacoes/${idSolicitacao}/status`,
        dados,
    );
}

export function buscarHistoricoSolicitacao(
    idSolicitacao: number,
    signal?: AbortSignal,
) {
    return api.get<HistoricoSolicitacao[]>(
        `/solicitacoes/${idSolicitacao}/historico`,
        { signal },
    );
}
