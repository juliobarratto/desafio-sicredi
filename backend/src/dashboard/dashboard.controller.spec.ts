import { Test, TestingModule } from "@nestjs/testing";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

describe("DashboardController", () => {
  let controller: DashboardController;
  const dashboardService = {
    obterResumo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("encaminha a consulta do dashboard para o service", async () => {
    dashboardService.obterResumo.mockResolvedValue({ totalSolicitacoes: 3 });

    await expect(controller.obterResumo()).resolves.toEqual({
      totalSolicitacoes: 3,
    });
    expect(dashboardService.obterResumo).toHaveBeenCalledTimes(1);
  });
});
