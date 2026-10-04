import { Injectable } from "@nestjs/common";
import { Prioridade, Status } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obterResumo() {
    const registrosAtivos = {
      dataExclusao: null,
    };

    const [totalSolicitacoes, totaisPorStatus, totaisPorPrioridade] =
      await this.prisma.$transaction([
        this.prisma.solicitacao.count({
          where: registrosAtivos,
        }),
        this.prisma.solicitacao.groupBy({
          by: ["status"],
          where: registrosAtivos,
          _count: true,
        }),
        this.prisma.solicitacao.groupBy({
          by: ["prioridade"],
          where: registrosAtivos,
          _count: true,
        }),
      ]);

    const quantidadePorStatus = (status: Status) => totaisPorStatus.find((item) => item.status === status)?._count ?? 0;
    const quantidadePorPrioridade = (prioridade: Prioridade) => totaisPorPrioridade.find((item) => item.prioridade === prioridade) ?._count ?? 0;

    return {
      totalSolicitacoes,
      solicitacoesAbertas: quantidadePorStatus(Status.ABERTA),
      solicitacoesEmAnalise: quantidadePorStatus(Status.EM_ANALISE),
      solicitacoesAprovadas: quantidadePorStatus(Status.APROVADA),
      solicitacoesRejeitadas: quantidadePorStatus(Status.REJEITADA),
      distribuicaoPorPrioridade: [
        {
          prioridade: Prioridade.BAIXA,
          quantidade: quantidadePorPrioridade(Prioridade.BAIXA),
        },
        {
          prioridade: Prioridade.MEDIA,
          quantidade: quantidadePorPrioridade(Prioridade.MEDIA),
        },
        {
          prioridade: Prioridade.ALTA,
          quantidade: quantidadePorPrioridade(Prioridade.ALTA),
        },
      ],
    };
  }
}
