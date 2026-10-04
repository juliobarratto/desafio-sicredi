import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { Prioridade, Status, TipoEvento } from "../generated/prisma/enums";
import { OrdemData } from "./dto/listar-solicitacoes.dto";
import { SolicitacoesService } from "./solicitacoes.service";

describe("SolicitacoesService", () => {
  let service: SolicitacoesService;
  const tx = {
    solicitacao: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    historicoSolicitacao: {
      create: jest.fn(),
    },
  };
  const prisma = {
    solicitacao: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    historicoSolicitacao: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((operacao: unknown) => {
      if (typeof operacao === "function") {
        return operacao(tx);
      }

      return Promise.all(operacao as Promise<unknown>[]);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitacoesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SolicitacoesService>(SolicitacoesService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("lista somente registros ativos com pesquisa, filtros e paginação", async () => {
    prisma.solicitacao.findMany.mockResolvedValue([]);
    prisma.solicitacao.count.mockResolvedValue(0);

    await expect(
      service.listar({
        pesquisa: " rede ",
        status: Status.ABERTA,
        prioridade: Prioridade.ALTA,
        ordemData: OrdemData.DESC,
        pagina: 2,
        limite: 5,
      }),
    ).resolves.toEqual({
      dados: [],
      paginacao: {
        pagina: 2,
        limite: 5,
        total: 0,
        totalPaginas: 0,
      },
    });

    expect(prisma.solicitacao.findMany).toHaveBeenCalledWith({
      where: {
        dataExclusao: null,
        status: Status.ABERTA,
        prioridade: Prioridade.ALTA,
        OR: expect.arrayContaining([
          { titulo: { contains: "rede", mode: "insensitive" } },
          { descricao: { contains: "rede", mode: "insensitive" } },
          { solicitante: { contains: "rede", mode: "insensitive" } },
          { areaSolicitante: { contains: "rede", mode: "insensitive" } },
        ]),
      },
      orderBy: { dataSolicitacao: OrdemData.DESC },
      skip: 5,
      take: 5,
    });
  });

  it("busca somente uma solicitação ativa", async () => {
    prisma.solicitacao.findFirst.mockResolvedValue({ idSolicitacao: 1 });

    await expect(service.buscarPorId(1)).resolves.toEqual({
      idSolicitacao: 1,
    });
    expect(prisma.solicitacao.findFirst).toHaveBeenCalledWith({
      where: {
        idSolicitacao: 1,
        dataExclusao: null,
      },
    });
  });

  it("retorna não encontrado para solicitação inexistente ou excluída", async () => {
    prisma.solicitacao.findFirst.mockResolvedValue(null);

    await expect(service.buscarPorId(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("cria a solicitação e o histórico na mesma transação", async () => {
    tx.solicitacao.create.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.ABERTA,
    });

    const dados = {
      titulo: "Nova rede",
      descricao: "Renovação da rede interna.",
      solicitante: "Julio",
      areaSolicitante: "Tecnologia",
      prioridade: Prioridade.ALTA,
    };

    await expect(service.criar(dados)).resolves.toEqual({
      idSolicitacao: 1,
      status: Status.ABERTA,
    });
    expect(tx.historicoSolicitacao.create).toHaveBeenCalledWith({
      data: {
        idSolicitacao: 1,
        tipoEvento: TipoEvento.CRIACAO,
        statusNovo: Status.ABERTA,
      },
    });
  });

  it("atualiza os dados sem permitir um corpo vazio", async () => {
    await expect(service.atualizar(1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );

    prisma.solicitacao.findFirst.mockResolvedValue({ idSolicitacao: 1 });
    prisma.solicitacao.update.mockResolvedValue({
      idSolicitacao: 1,
      titulo: "Título atualizado",
    });

    await expect(
      service.atualizar(1, { titulo: "Título atualizado" }),
    ).resolves.toEqual({
      idSolicitacao: 1,
      titulo: "Título atualizado",
    });
    expect(prisma.solicitacao.update).toHaveBeenCalledWith({
      where: { idSolicitacao: 1 },
      data: { titulo: "Título atualizado" },
    });
  });

  it("altera de ABERTA para EM_ANALISE e registra o histórico", async () => {
    tx.solicitacao.findFirst.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.ABERTA,
    });
    tx.solicitacao.update.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.EM_ANALISE,
    });

    await expect(
      service.alterarStatus(1, { status: Status.EM_ANALISE }),
    ).resolves.toEqual({
      idSolicitacao: 1,
      status: Status.EM_ANALISE,
    });
    expect(tx.solicitacao.findFirst).toHaveBeenCalledWith({
      where: {
        idSolicitacao: 1,
        dataExclusao: null,
      },
    });
    expect(tx.historicoSolicitacao.create).toHaveBeenCalledWith({
      data: {
        idSolicitacao: 1,
        tipoEvento: TipoEvento.ALTERACAO_STATUS,
        statusAnterior: Status.ABERTA,
        statusNovo: Status.EM_ANALISE,
        comentario: undefined,
      },
    });
  });

  it("exige comentário para aprovação e rejeição", async () => {
    tx.solicitacao.findFirst.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.EM_ANALISE,
    });

    await expect(
      service.alterarStatus(1, {
        status: Status.APROVADA,
        comentario: "   ",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.solicitacao.update).not.toHaveBeenCalled();
    expect(tx.historicoSolicitacao.create).not.toHaveBeenCalled();
  });

  it("remove espaços do comentário antes de registrá-lo", async () => {
    tx.solicitacao.findFirst.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.EM_ANALISE,
    });
    tx.solicitacao.update.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.REJEITADA,
    });

    await service.alterarStatus(1, {
      status: Status.REJEITADA,
      comentario: "  Fora do escopo.  ",
    });

    expect(tx.historicoSolicitacao.create).toHaveBeenCalledWith({
      data: {
        idSolicitacao: 1,
        tipoEvento: TipoEvento.ALTERACAO_STATUS,
        statusAnterior: Status.EM_ANALISE,
        statusNovo: Status.REJEITADA,
        comentario: "Fora do escopo.",
      },
    });
  });

  it("bloqueia transições não permitidas e estados finais", async () => {
    tx.solicitacao.findFirst.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.APROVADA,
    });

    await expect(
      service.alterarStatus(1, { status: Status.EM_ANALISE }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.solicitacao.update).not.toHaveBeenCalled();
  });

  it("não altera uma solicitação inexistente ou excluída", async () => {
    tx.solicitacao.findFirst.mockResolvedValue(null);

    await expect(
      service.alterarStatus(1, { status: Status.EM_ANALISE }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.solicitacao.update).not.toHaveBeenCalled();
  });

  it("faz exclusão lógica e registra o histórico na mesma transação", async () => {
    tx.solicitacao.findFirst.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.EM_ANALISE,
    });

    await service.excluir(1);

    expect(tx.solicitacao.update).toHaveBeenCalledWith({
      where: { idSolicitacao: 1 },
      data: { dataExclusao: expect.any(Date) },
    });
    expect(tx.historicoSolicitacao.create).toHaveBeenCalledWith({
      data: {
        idSolicitacao: 1,
        tipoEvento: TipoEvento.EXCLUSAO,
        statusAnterior: Status.EM_ANALISE,
        comentario: "Solicitação excluída logicamente.",
      },
    });
  });
});
