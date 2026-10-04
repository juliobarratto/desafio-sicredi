import { Test, TestingModule } from "@nestjs/testing";
import { Prioridade, Status } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { DashboardService } from "./dashboard.service";

describe("DashboardService", () => {
  let service: DashboardService;
  const prisma = {
    solicitacao: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn((operacoes: Promise<unknown>[]) =>
      Promise.all(operacoes),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("calcula os indicadores somente com solicitações ativas", async () => {
    prisma.solicitacao.count.mockResolvedValue(6);
    prisma.solicitacao.groupBy
      .mockResolvedValueOnce([
        { status: Status.ABERTA, _count: 2 },
        { status: Status.EM_ANALISE, _count: 1 },
        { status: Status.APROVADA, _count: 2 },
        { status: Status.REJEITADA, _count: 1 },
      ])
      .mockResolvedValueOnce([
        { prioridade: Prioridade.BAIXA, _count: 1 },
        { prioridade: Prioridade.MEDIA, _count: 2 },
        { prioridade: Prioridade.ALTA, _count: 3 },
      ]);

    await expect(service.obterResumo()).resolves.toEqual({
      totalSolicitacoes: 6,
      solicitacoesAbertas: 2,
      solicitacoesEmAnalise: 1,
      solicitacoesAprovadas: 2,
      solicitacoesRejeitadas: 1,
      distribuicaoPorPrioridade: [
        { prioridade: Prioridade.BAIXA, quantidade: 1 },
        { prioridade: Prioridade.MEDIA, quantidade: 2 },
        { prioridade: Prioridade.ALTA, quantidade: 3 },
      ],
    });

    expect(prisma.solicitacao.count).toHaveBeenCalledWith({
      where: { dataExclusao: null },
    });
    expect(prisma.solicitacao.groupBy).toHaveBeenCalledWith({
      by: ["status"],
      where: { dataExclusao: null },
      _count: true,
    });
  });
});
