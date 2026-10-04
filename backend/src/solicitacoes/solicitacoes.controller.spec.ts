import { Test, TestingModule } from "@nestjs/testing";
import { Status } from "../generated/prisma/enums";
import { OrdemData } from "./dto/listar-solicitacoes.dto";
import { SolicitacoesController } from "./solicitacoes.controller";
import { SolicitacoesService } from "./solicitacoes.service";

describe("SolicitacoesController", () => {
  let controller: SolicitacoesController;
  const solicitacoesService = {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarHistorico: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    alterarStatus: jest.fn(),
    excluir: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitacoesController],
      providers: [
        {
          provide: SolicitacoesService,
          useValue: solicitacoesService,
        },
      ],
    }).compile();

    controller = module.get<SolicitacoesController>(SolicitacoesController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("encaminha os filtros de listagem para o service", async () => {
    const filtros = {
      ordemData: OrdemData.DESC,
      pagina: 1,
      limite: 10,
    };
    solicitacoesService.listar.mockResolvedValue({ dados: [] });

    await controller.listar(filtros);

    expect(solicitacoesService.listar).toHaveBeenCalledWith(filtros);
  });

  it("encaminha a alteração de status para o service", async () => {
    const dados = {
      status: Status.APROVADA,
      comentario: "Aprovada pela área responsável.",
    };
    solicitacoesService.alterarStatus.mockResolvedValue({
      idSolicitacao: 1,
      status: Status.APROVADA,
    });

    await expect(controller.alterarStatus(1, dados)).resolves.toEqual({
      idSolicitacao: 1,
      status: Status.APROVADA,
    });
    expect(solicitacoesService.alterarStatus).toHaveBeenCalledWith(1, dados);
  });

  it("encaminha a exclusão lógica para o service", async () => {
    solicitacoesService.excluir.mockResolvedValue(undefined);

    await controller.excluir(1);

    expect(solicitacoesService.excluir).toHaveBeenCalledWith(1);
  });
});
