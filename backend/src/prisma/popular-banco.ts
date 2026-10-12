import {
  Prisma,
  PrismaClient,
  Prioridade,
  Status,
  TipoEvento,
} from "../generated/prisma/client";

const UM_DIA_EM_MILISSEGUNDOS = 24 * 60 * 60 * 1000;

function diasAtras(agora: Date, quantidade: number) {
  return new Date(agora.getTime() - quantidade * UM_DIA_EM_MILISSEGUNDOS);
}

function criarDadosDemonstracao(agora: Date) {
  return [
    {
      titulo: "Renovar notebooks da equipe comercial",
      descricao:
        "Substituir equipamentos com baixo desempenho utilizados pela equipe comercial.",
      solicitante: "Mariana Oliveira",
      areaSolicitante: "Comercial",
      prioridade: Prioridade.ALTA,
      status: Status.ABERTA,
      dataSolicitacao: diasAtras(agora, 2),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 2),
          },
        ],
      },
    },
    {
      titulo: "Atualizar assinaturas de e-mail",
      descricao:
        "Padronizar as assinaturas de e-mail conforme a nova identidade institucional.",
      solicitante: "Lucas Almeida",
      areaSolicitante: "Marketing",
      prioridade: Prioridade.BAIXA,
      status: Status.ABERTA,
      dataSolicitacao: diasAtras(agora, 4),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 4),
          },
        ],
      },
    },
    {
      titulo: "Revisar acesso ao sistema de crédito",
      descricao:
        "Revisar os perfis de acesso após a movimentação interna de colaboradores.",
      solicitante: "Fernanda Souza",
      areaSolicitante: "Riscos",
      prioridade: Prioridade.MEDIA,
      status: Status.EM_ANALISE,
      dataSolicitacao: diasAtras(agora, 7),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 7),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.ABERTA,
            statusNovo: Status.EM_ANALISE,
            dataEvento: diasAtras(agora, 6),
          },
        ],
      },
    },
    {
      titulo: "Corrigir integração da folha de pagamento",
      descricao:
        "Analisar divergências identificadas na integração mensal da folha.",
      solicitante: "Rafael Martins",
      areaSolicitante: "Gestão de Pessoas",
      prioridade: Prioridade.ALTA,
      status: Status.EM_ANALISE,
      dataSolicitacao: diasAtras(agora, 9),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 9),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.ABERTA,
            statusNovo: Status.EM_ANALISE,
            dataEvento: diasAtras(agora, 8),
          },
        ],
      },
    },
    {
      titulo: "Contratar licenças para análise de dados",
      descricao:
        "Disponibilizar licenças de BI para o acompanhamento dos indicadores da área.",
      solicitante: "Camila Ribeiro",
      areaSolicitante: "Dados",
      prioridade: Prioridade.ALTA,
      status: Status.APROVADA,
      dataSolicitacao: diasAtras(agora, 15),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 15),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.ABERTA,
            statusNovo: Status.EM_ANALISE,
            dataEvento: diasAtras(agora, 14),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.EM_ANALISE,
            statusNovo: Status.APROVADA,
            comentario: "Licenças aprovadas conforme disponibilidade orçamentária.",
            dataEvento: diasAtras(agora, 12),
          },
        ],
      },
    },
    {
      titulo: "Adequar sala para reuniões híbridas",
      descricao:
        "Instalar câmera, microfone e monitor na sala de reuniões do segundo andar.",
      solicitante: "Beatriz Costa",
      areaSolicitante: "Facilities",
      prioridade: Prioridade.MEDIA,
      status: Status.APROVADA,
      dataSolicitacao: diasAtras(agora, 18),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 18),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.ABERTA,
            statusNovo: Status.EM_ANALISE,
            dataEvento: diasAtras(agora, 17),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.EM_ANALISE,
            statusNovo: Status.APROVADA,
            comentario: "Adequação aprovada para o próximo ciclo de compras.",
            dataEvento: diasAtras(agora, 16),
          },
        ],
      },
    },
    {
      titulo: "Produzir brindes para evento interno",
      descricao:
        "Produzir kits personalizados para o encontro trimestral de colaboradores.",
      solicitante: "Gustavo Lima",
      areaSolicitante: "Comunicação",
      prioridade: Prioridade.BAIXA,
      status: Status.REJEITADA,
      dataSolicitacao: diasAtras(agora, 21),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 21),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.ABERTA,
            statusNovo: Status.EM_ANALISE,
            dataEvento: diasAtras(agora, 20),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.EM_ANALISE,
            statusNovo: Status.REJEITADA,
            comentario: "Solicitação adiada para priorizar ações essenciais do trimestre.",
            dataEvento: diasAtras(agora, 19),
          },
        ],
      },
    },
    {
      titulo: "Ampliar armazenamento compartilhado",
      descricao:
        "Aumentar temporariamente a capacidade do repositório compartilhado da área.",
      solicitante: "Patrícia Mendes",
      areaSolicitante: "Tecnologia",
      prioridade: Prioridade.MEDIA,
      status: Status.REJEITADA,
      dataSolicitacao: diasAtras(agora, 24),
      historicos: {
        create: [
          {
            tipoEvento: TipoEvento.CRIACAO,
            statusNovo: Status.ABERTA,
            dataEvento: diasAtras(agora, 24),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.ABERTA,
            statusNovo: Status.EM_ANALISE,
            dataEvento: diasAtras(agora, 23),
          },
          {
            tipoEvento: TipoEvento.ALTERACAO_STATUS,
            statusAnterior: Status.EM_ANALISE,
            statusNovo: Status.REJEITADA,
            comentario: "A capacidade atual atende à demanda após a política de retenção.",
            dataEvento: diasAtras(agora, 22),
          },
        ],
      },
    },
  ] satisfies Prisma.SolicitacaoCreateInput[];
}

export async function popularBancoSeVazio(
  prisma: PrismaClient,
  agora = new Date(),
) {
  const totalExistente = await prisma.solicitacao.count();

  if (totalExistente > 0) {
    return { quantidadeCriada: 0, bancoJaPossuiaDados: true };
  }

  const dados = criarDadosDemonstracao(agora);

  await prisma.$transaction(
    dados.map((data) => prisma.solicitacao.create({ data })),
  );

  return { quantidadeCriada: dados.length, bancoJaPossuiaDados: false };
}
