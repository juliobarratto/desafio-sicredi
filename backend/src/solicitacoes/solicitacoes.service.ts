import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { Status, TipoEvento } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { AlterarStatusSolicitacaoDto } from "./dto/alterar-status-solicitacao.dto";
import { AtualizarSolicitacaoDto } from "./dto/atualizar-solicitacao.dto";
import { CriarSolicitacaoDto } from "./dto/criar-solicitacao.dto";
import { ListarSolicitacoesDto } from "./dto/listar-solicitacoes.dto";

@Injectable()
export class SolicitacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: ListarSolicitacoesDto) {
    const pesquisa = filtros.pesquisa?.trim();
    const where: Prisma.SolicitacaoWhereInput = {
      dataExclusao: null,
      status: filtros.status,
      prioridade: filtros.prioridade,
      ...(pesquisa
        ? {
            OR: [
              { titulo: { contains: pesquisa, mode: "insensitive" } },
              {
                descricao: {
                  contains: pesquisa,
                  mode: "insensitive",
                },
              },
              {
                solicitante: {
                  contains: pesquisa,
                  mode: "insensitive",
                },
              },
              {
                areaSolicitante: {
                  contains: pesquisa,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [dados, total] = await this.prisma.$transaction([
      this.prisma.solicitacao.findMany({
        where,
        orderBy: [
          { dataSolicitacao: filtros.ordemData },
          { idSolicitacao: filtros.ordemData },
        ],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      }),
      this.prisma.solicitacao.count({ where }),
    ]);

    return {
      dados,
      paginacao: {
        pagina: filtros.pagina,
        limite: filtros.limite,
        total,
        totalPaginas: Math.ceil(total / filtros.limite),
      },
    };
  }

  async buscarPorId(idSolicitacao: number) {
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where: {
        idSolicitacao,
        dataExclusao: null,
      },
    });

    if (!solicitacao) {
      throw new NotFoundException(
        `Solicitação com ID ${idSolicitacao} não encontrada.`,
      );
    }

    return solicitacao;
  }

  async criar(dados: CriarSolicitacaoDto) {
    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacao.create({
        data: {
          titulo: dados.titulo,
          descricao: dados.descricao,
          solicitante: dados.solicitante,
          areaSolicitante: dados.areaSolicitante,
          prioridade: dados.prioridade,
        },
      });

      await tx.historicoSolicitacao.create({
        data: {
          idSolicitacao: solicitacao.idSolicitacao,
          tipoEvento: TipoEvento.CRIACAO,
          statusNovo: Status.ABERTA,
        },
      });

      return solicitacao;
    });
  }

  async atualizar(idSolicitacao: number, dados: AtualizarSolicitacaoDto) {
    const camposInformados = Object.values(dados).some(
      (valor) => valor !== undefined,
    );

    if (!camposInformados) {
      throw new BadRequestException(
        "Informe ao menos um campo para atualização.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacao.findFirst({
        where: { idSolicitacao, dataExclusao: null },
      });

      if (!solicitacao) {
        throw new NotFoundException(
          `Solicitação com ID ${idSolicitacao} não encontrada.`,
        );
      }

      if (
        solicitacao.status === Status.APROVADA ||
        solicitacao.status === Status.REJEITADA
      ) {
        throw new ConflictException(
          "Solicitações com decisão final não podem ser editadas.",
        );
      }

      const resultado = await tx.solicitacao.updateMany({
        where: {
          idSolicitacao,
          dataExclusao: null,
          status: solicitacao.status,
          titulo: solicitacao.titulo,
          descricao: solicitacao.descricao,
          solicitante: solicitacao.solicitante,
          areaSolicitante: solicitacao.areaSolicitante,
          prioridade: solicitacao.prioridade,
        },
        data: dados,
      });

      if (resultado.count !== 1) {
        throw new ConflictException(
          "A solicitação foi alterada por outra operação. Atualize os dados e tente novamente.",
        );
      }

      const solicitacaoAtualizada = await tx.solicitacao.findUnique({
        where: { idSolicitacao },
      });

      if (!solicitacaoAtualizada) {
        throw new ConflictException(
          "Não foi possível recuperar a solicitação atualizada.",
        );
      }

      return solicitacaoAtualizada;
    });
  }

  async buscarHistorico(idSolicitacao: number) {
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where: {
        idSolicitacao,
        dataExclusao: null,
      },
    });

    if (!solicitacao) {
      throw new NotFoundException(
        `Solicitação com ID ${idSolicitacao} não encontrada.`,
      );
    }

    return this.prisma.historicoSolicitacao.findMany({
      where: { idSolicitacao },
      orderBy: [{ dataEvento: "asc" }, { idHistorico: "asc" }],
    });
  }

  async alterarStatus(
    idSolicitacao: number,
    dados: AlterarStatusSolicitacaoDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacao.findFirst({
        where: {
          idSolicitacao,
          dataExclusao: null,
        },
      });

      if (!solicitacao) {
        throw new NotFoundException(
          `Solicitação com ID ${idSolicitacao} não encontrada.`,
        );
      }

      const transicoesPermitidas: Record<Status, Status[]> = {
        [Status.ABERTA]: [Status.EM_ANALISE],
        [Status.EM_ANALISE]: [Status.APROVADA, Status.REJEITADA],
        [Status.APROVADA]: [],
        [Status.REJEITADA]: [],
      };

      const transicaoPermitida = transicoesPermitidas[
        solicitacao.status
      ].includes(dados.status);

      if (!transicaoPermitida) {
        throw new ConflictException(
          `Não é permitido alterar o status de ${solicitacao.status} para ${dados.status}.`,
        );
      }

      const statusFinal =
        dados.status === Status.APROVADA || dados.status === Status.REJEITADA;
      const comentario = dados.comentario?.trim() || undefined;

      if (statusFinal && !comentario) {
        throw new BadRequestException(
          "Comentário é obrigatório para aprovação ou rejeição.",
        );
      }

      const resultado = await tx.solicitacao.updateMany({
        where: {
          idSolicitacao,
          dataExclusao: null,
          status: solicitacao.status,
        },
        data: { status: dados.status },
      });

      if (resultado.count !== 1) {
        throw new ConflictException(
          "O status da solicitação foi alterado por outra operação. Atualize os dados e tente novamente.",
        );
      }

      await tx.historicoSolicitacao.create({
        data: {
          idSolicitacao,
          tipoEvento: TipoEvento.ALTERACAO_STATUS,
          statusAnterior: solicitacao.status,
          statusNovo: dados.status,
          comentario,
        },
      });

      const solicitacaoAtualizada = await tx.solicitacao.findUnique({
        where: { idSolicitacao },
      });

      if (!solicitacaoAtualizada) {
        throw new ConflictException(
          "Não foi possível recuperar a solicitação atualizada.",
        );
      }

      return solicitacaoAtualizada;
    });
  }

  async excluir(idSolicitacao: number) {
    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacao.findUnique({
        where: { idSolicitacao },
      });

      if (!solicitacao) {
        throw new NotFoundException(
          `Solicitação com ID ${idSolicitacao} não encontrada.`,
        );
      }

      if (solicitacao.dataExclusao) {
        return;
      }

      const resultado = await tx.solicitacao.updateMany({
        where: {
          idSolicitacao,
          dataExclusao: null,
          status: solicitacao.status,
        },
        data: { dataExclusao: new Date() },
      });

      if (resultado.count !== 1) {
        const solicitacaoAtual = await tx.solicitacao.findUnique({
          where: { idSolicitacao },
        });

        if (solicitacaoAtual?.dataExclusao) {
          return;
        }

        throw new ConflictException(
          "A solicitação foi alterada por outra operação. Atualize os dados e tente novamente.",
        );
      }

      await tx.historicoSolicitacao.create({
        data: {
          idSolicitacao,
          tipoEvento: TipoEvento.EXCLUSAO,
          statusAnterior: solicitacao.status,
          comentario: "Solicitação excluída logicamente.",
        },
      });
    });
  }
}
