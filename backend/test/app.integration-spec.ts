import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { Prioridade, Status, TipoEvento } from "../src/generated/prisma/enums";
import { PrismaService } from "../src/prisma/prisma.service";

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

  async function criarSolicitacao() {
    const resposta = await request(app.getHttpServer())
      .post("/solicitacoes")
      .send({
        titulo: "  Nova rede  ",
        descricao: "  Renovação da rede interna.  ",
        solicitante: "  Julio  ",
        areaSolicitante: "  Tecnologia  ",
        prioridade: Prioridade.ALTA,
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

  it("torna a exclusão repetida idempotente sem duplicar histórico", async () => {
    const { idSolicitacao } = await criarSolicitacao();

    await request(app.getHttpServer())
      .delete(`/solicitacoes/${idSolicitacao}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/solicitacoes/${idSolicitacao}`)
      .expect(204);

    const exclusoes = await prisma.historicoSolicitacao.count({
      where: { idSolicitacao, tipoEvento: TipoEvento.EXCLUSAO },
    });
    expect(exclusoes).toBe(1);
  });

  afterAll(async () => {
    await app?.close();
  });
});
