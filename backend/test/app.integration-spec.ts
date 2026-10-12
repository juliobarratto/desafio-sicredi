import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { Prioridade, Status, TipoEvento } from "../src/generated/prisma/enums";
import { PrismaService } from "../src/prisma/prisma.service";
import { popularBancoSeVazio } from "../src/prisma/popular-banco";

function garantirBancoExclusivoDeTeste() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Os testes de integração exigem NODE_ENV=test.");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL é obrigatória para os testes de integração.");
  }

  const nomeBanco = new URL(databaseUrl).pathname.replace(/^\//, "");
  if (!nomeBanco.toLowerCase().includes("test")) {
    throw new Error(
      "A limpeza dos testes só pode usar um banco cujo nome contenha 'test'.",
    );
  }
}

describe("API com PostgreSQL (integration)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    garantirBancoExclusivoDeTeste();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.historicoSolicitacao.deleteMany();
    await prisma.solicitacao.deleteMany();
  });

  async function criarSolicitacao(
    dados: Partial<{
      titulo: string;
      descricao: string;
      solicitante: string;
      areaSolicitante: string;
      prioridade: Prioridade;
    }> = {},
  ) {
    const resposta = await request(app.getHttpServer())
      .post("/solicitacoes")
      .send({
        titulo: "  Nova rede  ",
        descricao: "  Renovação da rede interna.  ",
        solicitante: "  Julio  ",
        areaSolicitante: "  Tecnologia  ",
        prioridade: Prioridade.ALTA,
        ...dados,
      })
      .expect(201);

    return resposta.body as { idSolicitacao: number };
  }

  it("persiste dados normalizados e mantém solicitação e histórico consistentes", async () => {
    const { idSolicitacao } = await criarSolicitacao();

    const solicitacao = await prisma.solicitacao.findUniqueOrThrow({
      where: { idSolicitacao },
    });
    const historico = await prisma.historicoSolicitacao.findMany({
      where: { idSolicitacao },
    });

    expect(solicitacao).toEqual(
      expect.objectContaining({
        titulo: "Nova rede",
        descricao: "Renovação da rede interna.",
        solicitante: "Julio",
        areaSolicitante: "Tecnologia",
        status: Status.ABERTA,
      }),
    );
    expect(historico).toEqual([
      expect.objectContaining({
        tipoEvento: TipoEvento.CRIACAO,
        statusNovo: Status.ABERTA,
      }),
    ]);
  });

  it("popula somente um banco vazio com dados e históricos coerentes", async () => {
    const agora = new Date("2026-10-11T12:00:00.000Z");

    await expect(popularBancoSeVazio(prisma, agora)).resolves.toEqual({
      quantidadeCriada: 8,
      bancoJaPossuiaDados: false,
    });

    await expect(popularBancoSeVazio(prisma, agora)).resolves.toEqual({
      quantidadeCriada: 0,
      bancoJaPossuiaDados: true,
    });

    await expect(prisma.solicitacao.count()).resolves.toBe(8);
    await expect(prisma.historicoSolicitacao.count()).resolves.toBe(18);

    const quantidadesPorStatus = await prisma.solicitacao.groupBy({
      by: ["status"],
      _count: true,
    });

    expect(quantidadesPorStatus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: Status.ABERTA, _count: 2 }),
        expect.objectContaining({ status: Status.EM_ANALISE, _count: 2 }),
        expect.objectContaining({ status: Status.APROVADA, _count: 2 }),
        expect.objectContaining({ status: Status.REJEITADA, _count: 2 }),
      ]),
    );
  });

  it("aceita apenas uma de duas decisões finais concorrentes", async () => {
    const { idSolicitacao } = await criarSolicitacao();
    await request(app.getHttpServer())
      .patch(`/solicitacoes/${idSolicitacao}/status`)
      .send({ status: Status.EM_ANALISE })
      .expect(200);

    const [aprovacao, rejeicao] = await Promise.all([
      request(app.getHttpServer())
        .patch(`/solicitacoes/${idSolicitacao}/status`)
        .send({ status: Status.APROVADA, comentario: "Aprovada." }),
      request(app.getHttpServer())
        .patch(`/solicitacoes/${idSolicitacao}/status`)
        .send({ status: Status.REJEITADA, comentario: "Rejeitada." }),
    ]);

    expect([aprovacao.status, rejeicao.status].sort((a, b) => a - b)).toEqual([
      200, 409,
    ]);

    const eventosFinais = await prisma.historicoSolicitacao.count({
      where: {
        idSolicitacao,
        statusNovo: { in: [Status.APROVADA, Status.REJEITADA] },
      },
    });
    expect(eventosFinais).toBe(1);
  });

  it("bloqueia edição após decisão final", async () => {
    const { idSolicitacao } = await criarSolicitacao();
    await request(app.getHttpServer())
      .patch(`/solicitacoes/${idSolicitacao}/status`)
      .send({ status: Status.EM_ANALISE })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/solicitacoes/${idSolicitacao}/status`)
      .send({ status: Status.APROVADA, comentario: "Aprovada." })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/solicitacoes/${idSolicitacao}`)
      .send({ titulo: "Título alterado" })
      .expect(409);
  });

  it("aceita apenas uma de duas edições concorrentes", async () => {
    const { idSolicitacao } = await criarSolicitacao();

    const [primeiraEdicao, segundaEdicao] = await Promise.all([
      request(app.getHttpServer())
        .patch(`/solicitacoes/${idSolicitacao}`)
        .send({ titulo: "Primeira edição" }),
      request(app.getHttpServer())
        .patch(`/solicitacoes/${idSolicitacao}`)
        .send({ titulo: "Segunda edição" }),
    ]);

    expect(
      [primeiraEdicao.status, segundaEdicao.status].sort((a, b) => a - b),
    ).toEqual([200, 409]);
  });

  it("retorna 404 ao repetir a exclusão sem duplicar histórico", async () => {
    const { idSolicitacao } = await criarSolicitacao();

    await request(app.getHttpServer())
      .delete(`/solicitacoes/${idSolicitacao}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/solicitacoes/${idSolicitacao}`)
      .expect(404);

    const exclusoes = await prisma.historicoSolicitacao.count({
      where: { idSolicitacao, tipoEvento: TipoEvento.EXCLUSAO },
    });
    expect(exclusoes).toBe(1);
  });

  it("combina pesquisa, filtros, ordenação e paginação somente com registros ativos", async () => {
    const primeira = await criarSolicitacao({
      titulo: "Rede da agência",
      solicitante: "Ana",
    });
    const segunda = await criarSolicitacao({
      titulo: "Rede do atendimento",
      solicitante: "Bruno",
    });
    const excluida = await criarSolicitacao({
      titulo: "Rede desativada",
      solicitante: "Carla",
    });
    await criarSolicitacao({
      titulo: "Compra de cadeiras",
      prioridade: Prioridade.BAIXA,
    });

    await prisma.solicitacao.update({
      where: { idSolicitacao: primeira.idSolicitacao },
      data: { dataSolicitacao: new Date("2026-01-01T10:00:00.000Z") },
    });
    await prisma.solicitacao.update({
      where: { idSolicitacao: segunda.idSolicitacao },
      data: { dataSolicitacao: new Date("2026-01-02T10:00:00.000Z") },
    });
    await request(app.getHttpServer())
      .delete(`/solicitacoes/${excluida.idSolicitacao}`)
      .expect(204);

    const primeiraPagina = await request(app.getHttpServer())
      .get("/solicitacoes")
      .query({
        pesquisa: "rede",
        status: Status.ABERTA,
        prioridade: Prioridade.ALTA,
        ordemData: "asc",
        pagina: 1,
        limite: 1,
      })
      .expect(200);

    expect(primeiraPagina.body).toEqual({
      dados: [
        expect.objectContaining({ idSolicitacao: primeira.idSolicitacao }),
      ],
      paginacao: { pagina: 1, limite: 1, total: 2, totalPaginas: 2 },
    });

    const segundaPagina = await request(app.getHttpServer())
      .get("/solicitacoes")
      .query({
        pesquisa: "rede",
        status: Status.ABERTA,
        prioridade: Prioridade.ALTA,
        ordemData: "asc",
        pagina: 2,
        limite: 1,
      })
      .expect(200);

    expect(segundaPagina.body.dados).toEqual([
      expect.objectContaining({ idSolicitacao: segunda.idSolicitacao }),
    ]);
  });

  it("exclui solicitações apagadas logicamente dos indicadores", async () => {
    const ativa = await criarSolicitacao({ prioridade: Prioridade.MEDIA });
    const excluida = await criarSolicitacao({ prioridade: Prioridade.ALTA });

    await request(app.getHttpServer())
      .patch(`/solicitacoes/${ativa.idSolicitacao}/status`)
      .send({ status: Status.EM_ANALISE })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/solicitacoes/${excluida.idSolicitacao}`)
      .expect(204);

    const resposta = await request(app.getHttpServer())
      .get("/dashboard")
      .expect(200);

    expect(resposta.body).toEqual(
      expect.objectContaining({
        totalSolicitacoes: 1,
        solicitacoesAbertas: 0,
        solicitacoesEmAnalise: 1,
        solicitacoesAprovadas: 0,
        solicitacoesRejeitadas: 0,
      }),
    );
    expect(resposta.body.distribuicaoPorPrioridade).toContainEqual({
      prioridade: Prioridade.MEDIA,
      quantidade: 1,
    });
    expect(resposta.body.distribuicaoPorPrioridade).not.toContainEqual({
      prioridade: Prioridade.ALTA,
      quantidade: 1,
    });
  });

  it("registra e devolve o histórico completo em ordem cronológica", async () => {
    const { idSolicitacao } = await criarSolicitacao();

    await request(app.getHttpServer())
      .patch(`/solicitacoes/${idSolicitacao}/status`)
      .send({ status: Status.EM_ANALISE })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/solicitacoes/${idSolicitacao}/status`)
      .send({
        status: Status.APROVADA,
        comentario: "  Aprovada pelo comitê.  ",
      })
      .expect(200);

    const resposta = await request(app.getHttpServer())
      .get(`/solicitacoes/${idSolicitacao}/historico`)
      .expect(200);

    expect(resposta.body).toEqual([
      expect.objectContaining({
        tipoEvento: TipoEvento.CRIACAO,
        statusAnterior: null,
        statusNovo: Status.ABERTA,
      }),
      expect.objectContaining({
        tipoEvento: TipoEvento.ALTERACAO_STATUS,
        statusAnterior: Status.ABERTA,
        statusNovo: Status.EM_ANALISE,
      }),
      expect.objectContaining({
        tipoEvento: TipoEvento.ALTERACAO_STATUS,
        statusAnterior: Status.EM_ANALISE,
        statusNovo: Status.APROVADA,
        comentario: "Aprovada pelo comitê.",
      }),
    ]);
  });

  afterAll(async () => {
    await app?.close();
  });
});
