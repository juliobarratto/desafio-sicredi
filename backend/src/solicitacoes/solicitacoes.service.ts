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
        orderBy: {
          dataSolicitacao: filtros.ordemData,
        },
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

    await this.buscarPorId(idSolicitacao);

    return this.prisma.solicitacao.update({
      where: { idSolicitacao },
      data: dados,
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
      orderBy: { dataEvento: "asc" },
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

      const solicitacaoAtualizada = await tx.solicitacao.update({
        where: { idSolicitacao },
        data: { status: dados.status },
      });

      await tx.historicoSolicitacao.create({
        data: {
          idSolicitacao,
          tipoEvento: TipoEvento.ALTERACAO_STATUS,
          statusAnterior: solicitacao.status,
          statusNovo: dados.status,
          comentario,
        },
      });

      return solicitacaoAtualizada;
    });
  }

  async excluir(idSolicitacao: number) {
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

      await tx.solicitacao.update({
        where: { idSolicitacao },
        data: { dataExclusao: new Date() },
      });

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
