# Gestão de Solicitações Internas - Desafio Sicredi

Protótipo para centralizar solicitações internas, acompanhar seu andamento, preservar o histórico das decisões e disponibilizar indicadores operacionais.

O backend está implementado com NestJS, Prisma e PostgreSQL. O frontend em NextJS será desenvolvido separadamente como próxima etapa de aprendizado.

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

## Tecnologias

- Node.js e TypeScript
- NestJS 12
- Prisma 7
- PostgreSQL 16
- Jest e Supertest
- Docker Compose

## Estrutura

```text
desafio-sicredi/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- dashboard/
|   |   |-- prisma/
|   |   `-- solicitacoes/
|   `-- test/
|-- compose.yml
`-- README.md
```

O módulo `solicitacoes` concentra o fluxo principal. Os Controllers tratam HTTP, os DTOs validam a entrada e os Services aplicam as regras de negócio e coordenam o Prisma.

## Pré-requisitos

- Node.js 22 ou superior.
- npm 10 ou superior.
- Docker Desktop com Docker Compose.
- Portas `3000` e `5433` disponíveis.

## Execução local

### 1. Iniciar o PostgreSQL

Na raiz do projeto:

```powershell
docker compose up -d
docker compose ps
```

O PostgreSQL fica disponível em `localhost:5433`. Os dados são preservados no volume `postgres_data`.

### 2. Configurar o backend

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

Mais de uma origem CORS pode ser informada separando os endereços por vírgula.

### 3. Preparar o banco

```powershell
npx prisma generate
npx prisma migrate deploy
```

### 4. Iniciar a API

```powershell
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

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

Transições incompatíveis com o estado atual retornam `409 Conflict`. Aprovação ou rejeição sem comentário retorna `400 Bad Request`.

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
| `204` | Exclusão lógica concluída |
| `400` | Entrada inválida ou comentário obrigatório ausente |
| `404` | Solicitação inexistente ou excluída |
| `409` | Transição de status não permitida |

## Testes e qualidade

Dentro de `backend`:

```powershell
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Os testes unitários cobrem regras do Service e agregações do dashboard. Os testes E2E verificam rotas, pipes, DTOs e códigos HTTP com dependências controladas. O fluxo completo também pode ser exercitado contra o PostgreSQL local usando os exemplos da seção de API.

## Decisões técnicas

### Exclusão lógica

Uma solicitação excluída recebe `dataExclusao`, mas permanece no banco. Isso preserva a rastreabilidade e permite auditoria sem expor o registro nas consultas normais.

### Histórico imutável

Criação, mudanças de status e exclusão geram eventos em `historico_solicitacao`. O estado anterior e o novo estado ficam registrados quando aplicável.

### Transações

Operações que modificam a solicitação e geram histórico usam a mesma transação Prisma. Se qualquer gravação falhar, toda a operação é revertida.

### Separação das atualizações

Dados cadastrais usam `PATCH /solicitacoes/:id`. Mudanças de status usam um endpoint específico, no qual a máquina de estados e o comentário obrigatório são aplicados.

### Validação

O `ValidationPipe` remove a ambiguidade dos contratos, converte parâmetros quando necessário e rejeita propriedades que não pertencem aos DTOs.

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

- O frontend NextJS está intencionalmente pendente para uma etapa posterior de aprendizado.
- Autenticação e autorização ainda não foram implementadas.
- A integração externa está documentada, mas não implementada.
- Logs estruturados e observabilidade completa são evoluções futuras.
- Não há anexos nem notificações.

Esses itens não impedem a avaliação do backend atual, mas devem ser considerados antes de uma utilização em produção.

## Encerramento

Para interromper o PostgreSQL sem apagar os dados:

```powershell
docker compose down
```

O comando abaixo também remove o volume e apaga os dados locais; use somente quando essa for a intenção:

```powershell
docker compose down -v
```
