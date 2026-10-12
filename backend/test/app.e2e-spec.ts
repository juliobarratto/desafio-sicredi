import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { DashboardService } from "../src/dashboard/dashboard.service";
import { Prioridade, Status } from "../src/generated/prisma/enums";
import { PrismaService } from "../src/prisma/prisma.service";
import { SolicitacoesService } from "../src/solicitacoes/solicitacoes.service";

describe("API (e2e)", () => {
  let app: INestApplication<App>;

  const solicitacoesService = {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarHistorico: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    alterarStatus: jest.fn(),
    excluir: jest.fn(),
  };
  const dashboardService = {
    obterResumo: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(SolicitacoesService)
      .useValue(solicitacoesService)
      .overrideProvider(DashboardService)
      .useValue(dashboardService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /solicitacoes transforma e encaminha os filtros", async () => {
    solicitacoesService.listar.mockImplementation((filtros) => ({
      dados: [],
      filtros,
    }));

    const resposta = await request(app.getHttpServer())
      .get("/solicitacoes")
      .query({
        status: Status.ABERTA,
        prioridade: Prioridade.ALTA,
        pagina: "2",
        limite: "5",
      })
      .expect(200);

    expect(resposta.body.filtros).toEqual({
      status: Status.ABERTA,
      prioridade: Prioridade.ALTA,
      ordemData: "desc",
      pagina: 2,
      limite: 5,
    });
  });

  it("POST /solicitacoes valida e encaminha o cadastro", async () => {
    const dados = {
      titulo: "Nova rede",
      descricao: "Renovação da rede interna.",
      solicitante: "Julio",
      areaSolicitante: "Tecnologia",
      prioridade: Prioridade.ALTA,
    };
    solicitacoesService.criar.mockResolvedValue({
      idSolicitacao: 1,
      ...dados,
      status: Status.ABERTA,
    });

    await request(app.getHttpServer())
      .post("/solicitacoes")
      .send(dados)
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe(Status.ABERTA);
      });
  });

  it("normaliza os textos antes de encaminhar o cadastro", async () => {
    solicitacoesService.criar.mockImplementation((dados) => dados);

    await request(app.getHttpServer())
      .post("/solicitacoes")
      .send({
        titulo: "  Nova rede  ",
        descricao: "  Renovação da rede interna.  ",
        solicitante: "  Julio  ",
        areaSolicitante: "  Tecnologia  ",
        prioridade: Prioridade.ALTA,
      })
      .expect(201);

    expect(solicitacoesService.criar).toHaveBeenCalledWith({
      titulo: "Nova rede",
      descricao: "Renovação da rede interna.",
      solicitante: "Julio",
      areaSolicitante: "Tecnologia",
      prioridade: Prioridade.ALTA,
    });
  });

  it("rejeita campos obrigatórios formados apenas por espaços", async () => {
    await request(app.getHttpServer())
      .post("/solicitacoes")
      .send({
        titulo: "   ",
        descricao: "Descrição válida.",
        solicitante: "Julio",
        areaSolicitante: "Tecnologia",
        prioridade: Prioridade.ALTA,
      })
      .expect(400);

    expect(solicitacoesService.criar).not.toHaveBeenCalled();
  });

  it("rejeita prioridade inválida e propriedades desconhecidas", async () => {
    await request(app.getHttpServer())
      .post("/solicitacoes")
      .send({
        titulo: "Nova rede",
        descricao: "Renovação da rede interna.",
        solicitante: "Julio",
        areaSolicitante: "Tecnologia",
        prioridade: "URGENTE",
        propriedadeInesperada: true,
      })
      .expect(400);

    expect(solicitacoesService.criar).not.toHaveBeenCalled();
  });

  it("rejeita área solicitante acima do limite do modelo lógico", async () => {
    await request(app.getHttpServer())
      .post("/solicitacoes")
      .send({
        titulo: "Nova rede",
        descricao: "Renovação da rede interna.",
        solicitante: "Julio",
        areaSolicitante: "A".repeat(101),
        prioridade: Prioridade.ALTA,
      })
      .expect(400);

    expect(solicitacoesService.criar).not.toHaveBeenCalled();
  });

  it("rejeita ID que não seja inteiro", async () => {
    await request(app.getHttpServer()).get("/solicitacoes/abc").expect(400);
    expect(solicitacoesService.buscarPorId).not.toHaveBeenCalled();
  });

  it("PATCH /solicitacoes/:id/status valida o enum", async () => {
    await request(app.getHttpServer())
      .patch("/solicitacoes/1/status")
      .send({ status: "FINALIZADA" })
      .expect(400);

    expect(solicitacoesService.alterarStatus).not.toHaveBeenCalled();
  });

  it("DELETE /solicitacoes/:id retorna 204", async () => {
    solicitacoesService.excluir.mockResolvedValue(undefined);

    await request(app.getHttpServer()).delete("/solicitacoes/1").expect(204);
    expect(solicitacoesService.excluir).toHaveBeenCalledWith(1);
  });

  it("GET /dashboard retorna os indicadores", async () => {
    dashboardService.obterResumo.mockResolvedValue({ totalSolicitacoes: 4 });

    await request(app.getHttpServer())
      .get("/dashboard")
      .expect(200)
      .expect({ totalSolicitacoes: 4 });
  });

  afterAll(async () => {
    await app.close();
  });
});
