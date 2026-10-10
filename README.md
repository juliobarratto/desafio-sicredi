# Gestão de Solicitações Internas - Desafio Sicredi

Protótipo para centralizar solicitações internas, acompanhar seu andamento, preservar o histórico das decisões e disponibilizar indicadores operacionais.

A solução é full stack: o backend usa NestJS, Prisma e PostgreSQL, enquanto o frontend usa Next.js, React, Axios e Tailwind CSS.

## Funcionalidades implementadas

- Cadastro de solicitações com prioridade e status inicial `ABERTA`.
- Consulta individual de solicitações.
- Listagem paginada com pesquisa textual.
- Filtros por status e prioridade.
- Ordenação por data.
- Atualização dos dados cadastrais sem permitir alteração indireta do status.
- Fluxo controlado de status:

```text
ABERTA -> EM_ANALISE -> APROVADA
                     -> REJEITADA
```

- Comentário obrigatório para aprovação ou rejeição.
- Histórico de criação, alteração de status e exclusão.
- Exclusão lógica por meio de `dataExclusao`.
- Dashboard com totais por status e distribuição por prioridade.
- Validação global dos contratos de entrada.
- Tratamento de erros com códigos HTTP adequados.
- Testes unitários e testes HTTP automatizados.
- PostgreSQL executado por Docker Compose.
- Banco, migrations, backend e frontend executáveis juntos por Docker Compose.
- Interface responsiva com dashboard, indicadores e gráficos.
- Listagem visual com pesquisa, filtros, ordenação e paginação.
- Cadastro, consulta, edição e exclusão de solicitações pelo frontend.
- Mudança de status e consulta do histórico pelo frontend.
- Estados visuais de carregamento, erro, lista vazia e nova tentativa.

## Tecnologias

- Node.js e TypeScript
- NestJS 12
- Prisma 7
- PostgreSQL 16
- Jest e Supertest
- Next.js 16 e React 19
- Axios e Tailwind CSS 4
- Docker Compose

## Estrutura

```text
desafio-sicredi/
|-- backend/
|   |-- Dockerfile
|   |-- prisma/
|   |   |-- migrations/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- dashboard/
|   |   |-- prisma/
|   |   `-- solicitacoes/
|   `-- test/
|-- frontend/
|   |-- Dockerfile
|   |-- public/
|   `-- src/
|       |-- app/
|       |-- components/
|       |-- errors/
|       |-- features/
|       `-- lib/
|-- compose.yml
|-- package.json
`-- README.md
```

No backend, os Controllers tratam HTTP, os DTOs validam a entrada e os Services aplicam as regras de negócio e coordenam o Prisma. No frontend, `app` define as rotas e layouts, enquanto `features` agrupa componentes, types e services por funcionalidade.

## Pré-requisitos

- Para executar tudo em containers: Docker Desktop com Docker Compose.
- Para desenvolvimento fora dos containers: Node.js 22 ou superior e npm 10 ou superior.
- Portas `3000`, `3001` e `5433` disponíveis.

## Execução local

### Opção recomendada: aplicação completa com Docker

Na primeira execução, crie o arquivo local de variáveis a partir do exemplo versionado:

```powershell
Copy-Item .env.example .env
```

Depois, um único comando constrói as imagens, inicia o PostgreSQL, aplica as migrations e sobe backend e frontend:

```powershell
docker compose up --build -d
docker compose ps
```

Depois que os serviços estiverem saudáveis:

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- PostgreSQL: `localhost:5433`

As migrations são executadas automaticamente pelo serviço `migrate`. Os dados são preservados no volume `postgres_data`.

O `.env` da raiz é lido automaticamente pelo Docker Compose e fornece `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`. Ele é ignorado pelo Git. Essas credenciais são exclusivas para execução local, não protegem dados reais e devem ser trocadas caso o ambiente seja compartilhado. Para evitar problemas na montagem da `DATABASE_URL`, use uma senha alfanumérica ou codificada para URL.

Para acompanhar a inicialização:

```powershell
docker compose logs -f
```

Para encerrar sem apagar os dados:

```powershell
docker compose down
```

### Opção para desenvolvimento: Node.js local e banco no Docker

Inicie somente o PostgreSQL:

```powershell
docker compose up -d postgres
```

Configure o backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Variáveis disponíveis:

```dotenv
DATABASE_URL="postgresql://sicredi:sicredi@localhost:5433/sicredi?schema=public"
PORT=3000
CORS_ORIGINS="http://localhost:3001"
```

Prepare o banco:

```powershell
npx prisma generate
npx prisma migrate deploy
```

Inicie a API:

```powershell
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

Em outro terminal, configure e inicie o frontend:

Em outro terminal, a partir da raiz do projeto:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3001`. O script já fixa essa porta para não disputar a porta 3000 com a API.

Também é possível executar os serviços a partir da raiz, cada um em seu próprio terminal:

```powershell
npm run dev:backend
npm run dev:frontend
```

## Frontend

| Rota | Descrição |
|---|---|
| `/dashboard` | Indicadores, distribuição por status e prioridade e solicitações recentes |
| `/solicitacoes` | Listagem, pesquisa, filtros, ordenação e paginação |
| `/solicitacoes/nova` | Cadastro de solicitação |
| `/solicitacoes/:id` | Detalhes, histórico, mudança de status e exclusão |
| `/solicitacoes/:id/editar` | Edição dos dados cadastrais |

A raiz `/` redireciona para `/dashboard`. As ações disponíveis na página de detalhes acompanham a máquina de estados definida pelo backend.

## API

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/solicitacoes` | Cadastra uma solicitação |
| `GET` | `/solicitacoes` | Lista, pesquisa, filtra e pagina |
| `GET` | `/solicitacoes/:id` | Consulta uma solicitação ativa |
| `GET` | `/solicitacoes/:id/historico` | Consulta o histórico |
| `PATCH` | `/solicitacoes/:id` | Atualiza os dados cadastrais |
| `PATCH` | `/solicitacoes/:id/status` | Altera o status conforme o fluxo permitido |
| `DELETE` | `/solicitacoes/:id` | Realiza exclusão lógica |
| `GET` | `/dashboard` | Retorna os indicadores operacionais |

### Cadastro

```http
POST /solicitacoes
Content-Type: application/json
```

```json
{
  "titulo": "Renovar computadores",
  "descricao": "Os computadores da equipe precisam ser renovados.",
  "solicitante": "Julio",
  "areaSolicitante": "Tecnologia",
  "prioridade": "ALTA"
}
```

As prioridades aceitas são `BAIXA`, `MEDIA` e `ALTA`.

### Listagem

```http
GET /solicitacoes?pesquisa=computador&status=ABERTA&prioridade=ALTA&ordemData=desc&pagina=1&limite=10
```

Parâmetros opcionais:

| Parâmetro | Valores |
|---|---|
| `pesquisa` | Texto procurado em título, descrição, solicitante ou área |
| `status` | `ABERTA`, `EM_ANALISE`, `APROVADA` ou `REJEITADA` |
| `prioridade` | `BAIXA`, `MEDIA` ou `ALTA` |
| `ordemData` | `asc` ou `desc` |
| `pagina` | Inteiro a partir de 1 |
| `limite` | Inteiro entre 1 e 100 |

Resposta:

```json
{
  "dados": [],
  "paginacao": {
    "pagina": 1,
    "limite": 10,
    "total": 0,
    "totalPaginas": 0
  }
}
```

### Atualização cadastral

```http
PATCH /solicitacoes/1
Content-Type: application/json
```

```json
{
  "titulo": "Renovar computadores da equipe de atendimento",
  "prioridade": "MEDIA"
}
```

Ao menos um campo deve ser informado. O status não pode ser alterado por esse endpoint.

### Alteração de status

Primeiro, uma solicitação aberta deve entrar em análise:

```json
{
  "status": "EM_ANALISE"
}
```

Depois, ela pode ser aprovada ou rejeitada:

```json
{
  "status": "APROVADA",
  "comentario": "Solicitação aprovada pela área responsável."
}
```

Transições incompatíveis com o estado atual ou concorrentes retornam `409 Conflict`. Aprovação ou rejeição sem comentário retorna `400 Bad Request`. Solicitações aprovadas ou rejeitadas são finais e também não aceitam novas edições cadastrais.

### Dashboard

```json
{
  "totalSolicitacoes": 6,
  "solicitacoesAbertas": 2,
  "solicitacoesEmAnalise": 1,
  "solicitacoesAprovadas": 2,
  "solicitacoesRejeitadas": 1,
  "distribuicaoPorPrioridade": [
    { "prioridade": "BAIXA", "quantidade": 1 },
    { "prioridade": "MEDIA", "quantidade": 2 },
    { "prioridade": "ALTA", "quantidade": 3 }
  ]
}
```

Solicitações excluídas logicamente não participam das consultas nem dos indicadores.

## Códigos de resposta principais

| Código | Uso |
|---|---|
| `200` | Consulta ou atualização concluída |
| `201` | Solicitação cadastrada |
| `204` | Exclusão lógica concluída ou já realizada anteriormente |
| `400` | Entrada inválida ou comentário obrigatório ausente |
| `404` | Solicitação inexistente ou excluída nas operações de consulta |
| `409` | Estado incompatível, edição de decisão final ou conflito concorrente |

## Testes e qualidade

Dentro de `backend`:

```powershell
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Os testes unitários cobrem regras do Service e agregações do dashboard. Os testes E2E verificam rotas, pipes, DTOs e códigos HTTP com dependências controladas.

Para executar a suíte de integração em um PostgreSQL descartável e separado do banco de desenvolvimento:

```powershell
docker compose --profile test up -d --wait postgres-test
$env:NODE_ENV="test"
$env:DATABASE_URL="postgresql://sicredi_test:sicredi_test@localhost:5434/desafio_sicredi_test?schema=public"
cd backend
npx prisma migrate deploy
npm run test:integration
cd ..
docker compose --profile test rm -sf postgres-test
```

A suíte aborta antes da limpeza se `NODE_ENV` não for `test` ou se o nome do banco não contiver `test`.

Dentro de `frontend`:

```powershell
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

A partir da raiz, os comandos `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run test:integration` e `npm run test:frontend` encaminham a verificação para o projeto correspondente.

O workflow `.github/workflows/ci.yml` executa qualidade do backend, qualidade do frontend e integração PostgreSQL em jobs separados para pushes e pull requests direcionados à branch `main`.

## Decisões técnicas

### Exclusão lógica

Uma solicitação excluída recebe `dataExclusao`, mas permanece no banco. Isso preserva a rastreabilidade e permite auditoria sem expor o registro nas consultas normais.

### Histórico imutável

Criação, mudanças de status e exclusão geram eventos em `historico_solicitacao`. O estado anterior e o novo estado ficam registrados quando aplicável.

### Transações

Operações que modificam a solicitação e geram histórico usam a mesma transação Prisma. Se qualquer gravação falhar, toda a operação é revertida.

### Separação das atualizações

Dados cadastrais usam `PATCH /solicitacoes/:id`. Mudanças de status usam um endpoint específico, no qual a máquina de estados e o comentário obrigatório são aplicados. Depois de aprovada ou rejeitada, a solicitação torna-se imutável.

### Concorrência e idempotência

Edição, decisão e exclusão usam atualizações condicionais pelo estado previamente lido. Se outra operação modificar o registro primeiro, a API não sobrescreve silenciosamente a mudança. Exclusões repetidas são idempotentes e não duplicam o evento de histórico.

### Validação

O `ValidationPipe` remove a ambiguidade dos contratos, converte parâmetros quando necessário e rejeita propriedades que não pertencem aos DTOs. Textos são normalizados antes da validação; título, solicitante e área aceitam até 150 caracteres, descrição até 2.000 e comentário de decisão até 1.000.

## Evolução da solução

### Crescimento e escalabilidade

A API pode continuar sem estado e ser executada em múltiplas instâncias atrás de um balanceador. O PostgreSQL deve migrar para um serviço gerenciado com backups, métricas, alta disponibilidade e réplicas de leitura quando o volume justificar.

Consultas mais frequentes podem receber cache após medição. Pesquisa textual em grande escala pode evoluir para full-text search com índices apropriados. Arquivos e anexos devem ser armazenados em object storage.

### Disponibilidade e manutenibilidade

- Health checks e readiness probes.
- Logs estruturados com identificador de correlação.
- Métricas, tracing distribuído e alertas.
- Pipeline de CI com build, lint, testes e validação de migrations.
- Migrations revisadas e aplicadas de forma controlada.
- Documentação versionada dos contratos da API.
- Testes de integração com PostgreSQL efêmero.

### Segredos e configuração por ambiente

As credenciais presentes no `.env.example` existem apenas para facilitar a avaliação local. Senhas reais não devem ser gravadas no `compose.yml`, em Dockerfiles, em argumentos de build, em variáveis `NEXT_PUBLIC_*` nem no histórico do Git.

Em produção, `POSTGRES_PASSWORD` e `DATABASE_URL` devem ser fornecidas em tempo de execução por um gerenciador de segredos, como AWS Secrets Manager, Azure Key Vault, Google Secret Manager, HashiCorp Vault ou Secrets do Kubernetes. O acesso ao ambiente Docker também deve ser restrito, porque usuários com permissão para inspecionar containers podem visualizar suas variáveis de ambiente.

`NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`, portas e nomes de host são configurações públicas, não segredos. Em especial, qualquer variável `NEXT_PUBLIC_*` é incorporada ao JavaScript enviado ao navegador.

### Principais riscos técnicos

- Consultas lentas conforme o volume aumenta.
- Transições concorrentes sobre a mesma solicitação.
- Mudanças de regra sem cobertura de regressão.
- Perda de rastreabilidade por integrações externas mal projetadas.
- Exposição indevida de dados sem autenticação e autorização.
- Dependência de serviços externos durante operações síncronas.

### Componentes futuros

- Autenticação corporativa via OIDC/OAuth 2.0.
- Autorização por perfis e áreas.
- Usuários, anexos, notificações e comentários adicionais.
- Outbox transacional e worker de integração.
- Fila de mensagens e dead-letter queue.
- Documentação OpenAPI/Swagger.

## Integração com sistema corporativo externo

A aprovação não deve chamar o sistema externo diretamente durante a requisição HTTP. Na mesma transação que aprova a solicitação, a aplicação gravaria um evento em uma tabela de outbox.

Um worker independente faria a publicação em uma fila, como RabbitMQ, SQS ou Kafka, e um consumidor executaria a integração externa. Isso evita que a indisponibilidade do sistema corporativo bloqueie a experiência do usuário.

O fluxo incluiria:

- timeout nas chamadas externas;
- retry com backoff exponencial;
- circuit breaker;
- dead-letter queue após o limite de tentativas;
- chave de idempotência baseada no evento;
- identificador de correlação em logs e mensagens;
- armazenamento de cada tentativa e resultado;
- monitoramento e alertas para falhas persistentes.

O frontend poderia apresentar separadamente o status da solicitação e o status da integração.

## Escopo pendente e limitações

- Autenticação e autorização ainda não foram implementadas.
- A integração externa está documentada, mas não implementada.
- Logs estruturados e observabilidade completa são evoluções futuras.
- Não há anexos nem notificações.
- A suíte de integração cobre os fluxos críticos com PostgreSQL real, mas ainda não representa testes de carga ou recuperação de desastre.
- O frontend possui testes de componentes para formulários, imutabilidade e decisão; ainda não inclui automação E2E em navegador real.

Esses itens não impedem a avaliação do protótipo, mas devem ser considerados antes de uma utilização em produção.

## Encerramento

Para interromper o PostgreSQL sem apagar os dados:

```powershell
docker compose down
```

O comando abaixo também remove o volume e apaga os dados locais; use somente quando essa for a intenção:

```powershell
docker compose down -v
```
