# Gestão de Solicitações Internas — Desafio Sicredi

Aplicação full stack para cadastrar, acompanhar e decidir solicitações internas, preservando o histórico das operações e apresentando indicadores gerenciais.

**Autor:** Julio Cesar R. Barratto · **Stack principal:** NestJS, Prisma, PostgreSQL, Next.js, React e Docker Compose.

## Sumário

- [Execução rápida](#execução-rápida)
- [O que foi entregue](#o-que-foi-entregue)
- [Capturas da aplicação](#capturas-da-aplicação)
- [Arquitetura e modelo de dados](#arquitetura-e-modelo-de-dados)
- [Desenvolvimento local](#desenvolvimento-local)
- [Frontend e API](#frontend-e-api)
- [Testes e qualidade](#testes-e-qualidade)
- [Decisões técnicas](#decisões-técnicas)
- [Evolução para produção](#evolução-para-produção)
- [Uso de inteligência artificial](#uso-de-inteligência-artificial)

## Execução rápida

### Pré-requisitos

- Docker Desktop com Docker Compose.
- Portas `3000`, `3001` e `5433` disponíveis.

No PowerShell, a partir da raiz do projeto:

```powershell
Copy-Item .env.example .env
docker compose up --build -d --wait
docker compose ps
```

O ambiente estará disponível nos seguintes endereços:

| Serviço | Endereço |
|---|---|
| Aplicação web | http://localhost:3001 |
| API | http://localhost:3000 |
| PostgreSQL | `localhost:5433` |

O serviço `migrate` aplica as migrations e, em seguida, o serviço `seed` cria 8 solicitações fictícias com históricos coerentes. O seed só popula um banco sem solicitações; por isso, novas subidas do ambiente não duplicam registros nem alteram dados existentes. Os dados são preservados no volume `postgres_data`.

Para acompanhar os logs ou encerrar o ambiente:

```powershell
docker compose logs -f
docker compose down
```

> `docker compose down -v` também remove o volume do PostgreSQL e apaga os dados locais.

## O que foi entregue

| Área | Implementação |
|---|---|
| Gestão | Cadastro, consulta, edição e exclusão lógica de solicitações |
| Fluxo | Máquina de estados com decisões finais imutáveis |
| Rastreabilidade | Histórico de criação, mudança de status e exclusão |
| Consulta | Pesquisa textual, filtros, ordenação e paginação |
| Dashboard | Totais por status, distribuição por prioridade e registros recentes |
| Experiência | Interface responsiva e estados de carregamento, erro, vazio e nova tentativa |
| Persistência | PostgreSQL, Prisma, migrations e índices para consultas frequentes |
| Dados iniciais | Seed idempotente com solicitações em todos os status |
| Qualidade | Testes unitários, HTTP, integração com PostgreSQL real e componentes React |
| Entrega | Ambiente completo em Docker Compose e pipeline de CI |

O fluxo de status permitido é:

```text
ABERTA -> EM_ANALISE -> APROVADA
                     -> REJEITADA
```

- Toda solicitação nasce com status `ABERTA`.
- Aprovação e rejeição exigem comentário.
- Solicitações aprovadas ou rejeitadas não aceitam novas alterações.
- O status só pode ser modificado pelo endpoint específico de transição.

## Capturas da aplicação

| Dashboard | Pesquisa e filtros |
|---|---|
| ![Dashboard com indicadores das solicitações](docs/images/dashboard.png) | ![Listagem com pesquisa, status e prioridade filtrados](docs/images/filtros-solicitacoes.png) |

| Cadastro | Edição |
|---|---|
| ![Formulário para criar uma solicitação](docs/images/nova-solicitacao.png) | ![Formulário para editar uma solicitação](docs/images/editar-solicitacao.png) |

| Detalhes, decisão e histórico |
|---|
| ![Detalhes da solicitação com ações e histórico](docs/images/detalhes-solicitacao.png) |

## Arquitetura e modelo de dados

```mermaid
flowchart LR
    U[Usuário] --> F[Next.js + React + TypeScript]
    F -->|HTTP / JSON| B[NestJS + TypeScript]
    B --> P[Prisma ORM]
    P --> DB[(PostgreSQL)]
```

| Camada | Responsabilidade |
|---|---|
| Next.js | Rotas, layout e composição das páginas |
| React | Formulários, estados visuais e interação |
| TypeScript | Tipagem compartilhada no frontend e backend, contratos e segurança durante o desenvolvimento |
| Axios | Comunicação do frontend com a API |
| NestJS | Contratos HTTP, validação e regras de negócio |
| Prisma | Acesso tipado, transações e consultas ao banco |
| PostgreSQL | Persistência das solicitações e de seus históricos |

### Modelo lógico

![Modelo lógico do banco de dados](docs/images/modelo-logico.jpg)

O modelo foi elaborado no [Miro](https://miro.com/app/board/uXjVEf_DkGc=/?moveToWidget=3458764685739506927). A imagem também está versionada no repositório.

### Estrutura do projeto

```text
desafio-sicredi/
|-- .github/workflows/ci.yml
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |-- dashboard/
|   |   |-- prisma/
|   |   `-- solicitacoes/
|   `-- test/
|-- docs/images/
|-- frontend/
|   `-- src/
|       |-- app/
|       |-- components/
|       |-- errors/
|       |-- features/
|       |-- lib/
|       `-- test/
|-- compose.yml
|-- package.json
`-- README.md
```

No backend, Controllers cuidam do protocolo HTTP, DTOs validam as entradas e Services concentram regras de negócio e transações. No frontend, `app` define rotas e layouts, enquanto `features` organiza componentes, tipos e serviços por domínio.

## Desenvolvimento local

Para executar fora dos containers, use Node.js `>=24.9.0 <25` e npm 11. O PostgreSQL pode continuar no Docker.

### Backend

```powershell
docker compose up -d --wait postgres
cd backend
Copy-Item .env.example .env
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run build
npm run prisma:seed
npm run start:dev
```

A API será iniciada em `http://localhost:3000` com estas variáveis locais:

```dotenv
DATABASE_URL="postgresql://sicredi:sicredi@localhost:5433/sicredi?schema=public"
PORT=3000
CORS_ORIGINS="http://localhost:3001"
```

### Frontend

Em outro terminal, a partir da raiz:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

A aplicação será iniciada em `http://localhost:3001`.

Depois que as dependências de ambos os projetos estiverem instaladas, também é possível iniciar cada serviço pelos atalhos da raiz:

```powershell
npm run dev:backend
npm run dev:frontend
```

O comando `npm run prisma:seed` é seguro para repetição: ele cria os dados fictícios somente quando não existe nenhuma solicitação. As credenciais de `.env.example` servem apenas para avaliação local. Se o ambiente for compartilhado, altere a senha e use um valor alfanumérico ou codificado para URL.

## Frontend e API

### Rotas do frontend

| Rota | Descrição |
|---|---|
| `/dashboard` | Indicadores, gráficos e solicitações recentes |
| `/solicitacoes` | Listagem, pesquisa, filtros, ordenação e paginação |
| `/solicitacoes/nova` | Cadastro de solicitação |
| `/solicitacoes/:id` | Detalhes, histórico, mudança de status e exclusão |
| `/solicitacoes/:id/editar` | Edição dos dados cadastrais |

A raiz `/` redireciona para `/dashboard`. As ações exibidas na página de detalhes acompanham o estado atual da solicitação.

### Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/solicitacoes` | Cadastra uma solicitação |
| `GET` | `/solicitacoes` | Lista, pesquisa, filtra, ordena e pagina |
| `GET` | `/solicitacoes/:id` | Consulta uma solicitação ativa |
| `GET` | `/solicitacoes/:id/historico` | Consulta o histórico |
| `PATCH` | `/solicitacoes/:id` | Atualiza dados cadastrais |
| `PATCH` | `/solicitacoes/:id/status` | Executa uma transição de status |
| `DELETE` | `/solicitacoes/:id` | Realiza a exclusão lógica |
| `GET` | `/dashboard` | Retorna os indicadores operacionais |

Parâmetros opcionais de `GET /solicitacoes`:

| Parâmetro | Valores |
|---|---|
| `pesquisa` | Texto no título, descrição, solicitante ou área |
| `status` | `ABERTA`, `EM_ANALISE`, `APROVADA` ou `REJEITADA` |
| `prioridade` | `BAIXA`, `MEDIA` ou `ALTA` |
| `ordemData` | `asc` ou `desc` |
| `pagina` | Inteiro a partir de 1; padrão `1` |
| `limite` | Inteiro entre 1 e 100; padrão `10` |

<details>
<summary><strong>Exemplos de requisições e respostas</strong></summary>

#### Cadastro

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

#### Listagem

```http
GET /solicitacoes?pesquisa=computador&status=ABERTA&prioridade=ALTA&ordemData=desc&pagina=1&limite=10
```

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

#### Alteração de status

Primeiro, uma solicitação aberta entra em análise:

```json
{
  "status": "EM_ANALISE"
}
```

Depois, ela pode receber uma decisão final:

```json
{
  "status": "APROVADA",
  "comentario": "Solicitação aprovada pela área responsável."
}
```

#### Dashboard

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

</details>

### Validações e respostas

- Título e solicitante: até 150 caracteres.
- Área solicitante: até 100 caracteres.
- Descrição: até 2.000 caracteres.
- Comentário de decisão: até 1.000 caracteres.
- Propriedades fora dos DTOs são rejeitadas.
- Textos são normalizados antes da validação.

| Código | Uso principal |
|---|---|
| `200` | Consulta ou atualização concluída |
| `201` | Solicitação cadastrada |
| `204` | Exclusão lógica concluída |
| `400` | Entrada inválida ou comentário obrigatório ausente |
| `404` | Solicitação inexistente ou já excluída |
| `409` | Transição inválida, decisão final imutável ou conflito concorrente |

Solicitações excluídas logicamente não aparecem nas consultas nem nos indicadores.

## Testes e qualidade

A entrega possui **50 testes automatizados**:

| Suíte | Quantidade | Cobertura principal |
|---|---:|---|
| Backend unitário | 26 | Services, Controllers, configuração e dashboard |
| Backend E2E HTTP | 10 | Rotas, pipes, DTOs e códigos HTTP |
| Backend integração | 9 | Persistência, seed, transações e concorrência em PostgreSQL real |
| Frontend componentes | 5 | Formulários, edição, imutabilidade e decisão |

Comandos disponíveis na raiz:

```powershell
npm run build
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run test:frontend
```

### Integração com PostgreSQL descartável

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

A suíte contém proteções para não limpar um banco que não esteja identificado como ambiente de teste. Ela cobre normalização, filtros, paginação, concorrência, exclusão lógica, indicadores, idempotência do seed e o histórico completo do fluxo.

### Integração contínua

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) é executado em pushes e pull requests para `main` e separa a validação em quatro jobs:

1. qualidade do backend;
2. qualidade do frontend;
3. integração com PostgreSQL;
4. build e smoke test do ambiente Docker Compose.

A CI também audita as dependências de produção e bloqueia vulnerabilidades de severidade alta. A automação E2E em navegador real foi mantida fora do escopo.

## Decisões técnicas

### Exclusão lógica e histórico

A exclusão preenche `dataExclusao`, mantendo o registro no banco para auditoria. Criação, mudanças de status e exclusão geram eventos em `historico_solicitacao`.

### Transações e consistência

Operações que alteram a solicitação e registram histórico usam a mesma transação Prisma. Edição, decisão e exclusão também usam atualizações condicionais para evitar que operações concorrentes sobrescrevam mudanças silenciosamente. Uma exclusão repetida retorna `404` e não duplica o histórico.

### Separação entre cadastro e decisão

Dados cadastrais usam `PATCH /solicitacoes/:id`; mudanças de status usam `PATCH /solicitacoes/:id/status`. Essa separação impede alterações indiretas no fluxo e mantém a regra de decisão explícita.

### Consultas e índices

Os índices priorizam registros ativos por data, status e prioridade. A pesquisa textual permanece simples por ser adequada ao volume esperado para o protótipo.

### Configuração e containers

- Variáveis obrigatórias são validadas na inicialização.
- CORS aceita apenas as origens configuradas.
- Backend e frontend executam como usuário não privilegiado nas imagens finais.
- A imagem do backend mantém apenas dependências de produção necessárias.
- Health checks controlam a ordem de inicialização no Compose.
- Migrations e seed são executados por serviços dedicados antes da API.

## Limitações conhecidas

A aplicação atende ao escopo funcional do desafio, mas ainda não reúne todos os controles necessários para utilização em produção.

| Limitação atual | Impacto |
|---|---|
| Não há autenticação nem autorização | Qualquer pessoa com acesso à aplicação pode consultar e modificar solicitações |
| Não há segregação por usuário, perfil ou área | Todas as solicitações ficam disponíveis no mesmo contexto |
| A integração com o sistema corporativo não foi implementada | Aprovações não produzem efeitos fora da aplicação |
| Não há anexos, notificações ou discussões adicionais | O acompanhamento fica restrito aos dados e ao histórico da solicitação |
| A observabilidade está limitada aos health checks | Ainda não há logs estruturados, métricas, tracing ou alertas |
| O PostgreSQL utiliza um volume local | Backups, replicação e recuperação de desastre não estão configurados |
| Não há testes automatizados em navegador real | Os componentes são testados isoladamente, mas o fluxo visual completo ainda depende de validação manual |
| Não há testes de carga, caos ou recuperação | O comportamento sob alto volume e falhas de infraestrutura ainda não foi medido |


## Evolução para produção

A solução atende ao escopo do desafio e está preparada para avaliação local. Para operar em produção, seria necessário evoluir principalmente segurança, observabilidade, disponibilidade e integração com sistemas corporativos.
As evoluções abaixo estão organizadas por responsabilidade e devem ser implementadas de forma incremental, orientadas pelo volume de uso, pelos requisitos de segurança e pelos níveis de serviço esperados.

### Segurança e acesso

A aplicação atual não possui autenticação nem autorização e deve ser utilizada apenas em ambiente local de avaliação. Antes de uma disponibilização em produção, o acesso precisa ser integrado ao provedor de identidade corporativo.

A autenticação pode utilizar OIDC ou OAuth 2.0, permitindo login centralizado, aplicação das políticas corporativas e revogação de acesso. O backend deve validar a identidade em todas as rotas protegidas e não confiar apenas em controles implementados no frontend.

A autorização deve considerar, no mínimo:

- perfil ou função do usuário;
- área à qual o usuário pertence;
- operações permitidas para cada perfil;
- propriedade ou visibilidade da solicitação;
- separação entre quem solicita, analisa e decide.

Além do histórico funcional da solicitação, operações sensíveis devem gerar registros de auditoria contendo usuário, ação, data, resultado e identificador de correlação. Esses registros não devem ser alteráveis pela interface da aplicação.

A proteção da infraestrutura deve incluir:

- HTTPS em todas as comunicações;
- banco de dados sem exposição direta à internet;
- CORS restrito às origens autorizadas;
- limitação de requisições e proteção contra abuso;
- cabeçalhos HTTP de segurança;
- validação de tamanho e formato das entradas;
- atualização e auditoria contínua de dependências e imagens.

Credenciais e chaves não devem ser armazenadas no código, em Dockerfiles, em argumentos de build ou no histórico do Git. Em produção, segredos devem ser fornecidos em tempo de execução por um gerenciador apropriado e rotacionados periodicamente.

O seed com informações fictícias existe exclusivamente para facilitar a avaliação local. Ele não deve ser executado em ambientes de produção. 

### Operação e escala

A execução atual foi preparada para avaliação local com Docker Compose. Em produção, a aplicação precisaria evoluir para uma infraestrutura com maior disponibilidade, observabilidade e capacidade de recuperação.

Como a API não mantém estado em memória entre requisições, o backend pode ser executado em múltiplas instâncias atrás de um balanceador de carga. O frontend também pode ser replicado ou distribuído por uma CDN, conforme a estratégia de hospedagem adotada.

O PostgreSQL deveria ser executado em um serviço gerenciado ou ambiente equivalente, com:

- backups automáticos e restauração testada;
- recuperação para um ponto específico no tempo;
- alta disponibilidade e replicação;
- monitoramento de conexões, armazenamento e consultas lentas;
- política definida de retenção e descarte de dados.

A operação da aplicação deveria incluir:

- logs estruturados em formato pesquisável;
- identificador de correlação propagado entre requisições e serviços;
- métricas técnicas e de negócio;
- tracing distribuído para fluxos entre serviços;
- health checks de execução;
- readiness probes para controlar o recebimento de tráfego;
- alertas baseados em disponibilidade, latência e taxa de erros;
- definição de objetivos de nível de serviço.

As migrations devem ser aplicadas de forma controlada e compatível com versões anteriores da aplicação. Em alterações maiores, a evolução do banco deve ser dividida em etapas para permitir implantação gradual e rollback seguro.

O aumento de capacidade deve ser orientado por métricas. Antes de introduzir cache, réplicas de leitura ou mecanismos externos de busca, é necessário medir volume, latência e padrões de consulta.

Caso a pesquisa textual simples deixe de atender ao volume esperado, ela pode evoluir para full-text search do PostgreSQL. Uma ferramenta dedicada de busca deve ser considerada somente quando os requisitos justificarem sua complexidade operacional.

Testes de carga, recuperação de desastre e falhas de infraestrutura devem fazer parte da preparação para produção, permitindo definir limites seguros e validar os procedimentos operacionais.

### Integração com sistema corporativo

A integração externa não faz parte da implementação atual. Em produção, uma solicitação aprovada poderia originar um processo em outro sistema corporativo.

Essa comunicação não deveria ocorrer diretamente durante a alguma das requisição HTTP, seja de aprovação ou de rejeição. A disponibilidade e o tempo de resposta do sistema externo não podem bloquear a decisão registrada na aplicação.

O fluxo recomendado utiliza o padrão de outbox transacional:

```mermaid
flowchart LR
    A[Aprovação da solicitação] --> T[Transação no PostgreSQL]
    T --> S[Atualiza solicitação]
    T --> H[Registra histórico]
    T --> O[Grava evento na outbox]
    O --> W[Worker]
    W --> F[Fila de mensagens]
    F --> C[Consumidor]
    C --> E[Sistema corporativo]
```

A solicitação, o histórico e o evento da outbox seriam gravados na mesma transação. Dessa forma, uma aprovação confirmada sempre possuiria um evento correspondente para integração.

O processamento externo incluiria:

- chave de idempotência baseada no identificador do evento;
- timeout nas chamadas externas;
- retry com backoff exponencial e limite de tentativas;
- circuit breaker para falhas persistentes;
- dead-letter queue para mensagens que não puderam ser processadas;
- identificador de correlação entre solicitação, evento e chamada externa;
- registro das tentativas, respostas e erros;
- métricas e alertas para eventos pendentes ou com falha.

O status da solicitação e o status da integração devem ser independentes. Uma solicitação pode estar `APROVADA` enquanto sua integração permanece `PENDENTE`, `PROCESSANDO`, `CONCLUIDA` ou `FALHOU`.

Essa separação preserva a decisão de negócio, permite reprocessamento seguro e evita que indisponibilidades externas prejudiquem a experiência do usuário.

## Uso de inteligência artificial

ChatGPT/Codex foi utilizado como apoio de pair programming durante o desenvolvimento para:

- gerar e revisar código;
- ampliar cenários de teste;
- diagnosticar falhas;
- revisar segurança, execução em containers e documentação.

As decisões finais permaneceram sob minha responsabilidade. As sugestões foram revisadas e validadas com lint, verificação de tipos, testes, build e smoke test do ambiente Docker.
