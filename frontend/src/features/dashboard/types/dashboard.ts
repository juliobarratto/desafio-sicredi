import type {
    Prioridade,
} from '@/features/solicitacoes/types/solicitacao'

export interface DistribuicaoPorPrioridade {
    prioridade: Prioridade;
    quantidade: number;
}

export interface ResumoDashboard {
    totalSolicitacoes: number;
    solicitacoesAbertas: number;
    solicitacoesEmAnalise: number;
    solicitacoesAprovadas: number;
    solicitacoesRejeitadas: number;
    distribuicaoPorPrioridade: DistribuicaoPorPrioridade[];
}