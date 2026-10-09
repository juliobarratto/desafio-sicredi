# Tela de solicitações: guia de leitura

Acesse http://localhost:3001/solicitacoes com o backend na porta 3000.

## Ordem para estudar

1. `src/app/(painel)/solicitacoes/page.tsx`: monta o título, a mensagem depois da exclusão, o botão de cadastro e chama a lista. Não busca dados nem precisa de `use client`.
2. `src/features/solicitacoes/components/lista-solicitacoes.tsx`: coordena consulta, carregamento, erros e paginação. É como um Frame que controla a consulta e alimenta a visualização.
3. `filtros-solicitacoes.tsx`: um formulário. Aplicar filtros lê os campos com `FormData` e avisa a lista por uma função recebida em props. Limpar restaura os campos e a consulta padrão. Alterar campos só afeta a busca quando você aplica.
4. `tabela-solicitacoes.tsx`: recebe os registros por props e apresenta tabela no desktop e cartões no celular. Não chama a API.
5. `prioridade-badge.tsx` e `status-badge.tsx`: transformam os valores do backend em rótulos e cores.
6. `formulario-solicitacao.tsx`: é reutilizado para cadastrar e editar. Lê o formulário, remove espaços extras, chama o service correto e navega para os detalhes depois do sucesso.
7. `editar-solicitacao.tsx`: carrega a solicitação antes de entregar os valores iniciais ao formulário de edição.
8. `detalhes-solicitacao.tsx`: coordena a consulta individual e o histórico, mostra as próximas ações permitidas, exige comentário na decisão e executa a exclusão após confirmação.
9. `services/solicitacoes.service.ts`: centraliza todas as chamadas HTTP. O cliente HTTP já extrai o JSON, então cada função retorna diretamente o tipo de dado esperado.
10. As rotas `nova`, `[id]` e `[id]/editar` conectam as URLs aos componentes sem duplicar a lógica dos formulários.

## O fluxo

Filtros/paginação alteram `consulta` pelo `useState`. O `useEffect` reage à mudança e pede dados ao service. A resposta atualiza a tela. A pesquisa passa por título, descrição, solicitante e área, conforme implementado no backend.

Aplicar/limpar filtros e trocar o limite voltam à página 1. Trocar uma consulta cancela a anterior com `AbortController`, para uma resposta antiga não sobrescrever a atual. O resultado guarda a consulta a que pertence; enquanto a nova consulta não chega, mostramos carregamento em vez de registros de outros filtros.

## Fluxos de manutenção

```text
/solicitacoes
  -> /solicitacoes/nova
  -> /solicitacoes/[id]
       -> /solicitacoes/[id]/editar
       -> iniciar análise
       -> aprovar ou rejeitar com comentário
       -> excluir e voltar para a lista
```

O formulário recebe `modo="criar"` sem uma solicitação ou `modo="editar"` com uma solicitação existente. Essa prop forma uma união discriminada: o TypeScript impede usar o modo de edição sem fornecer os dados iniciais.

Na página de detalhes, solicitação e histórico são carregados em paralelo com `Promise.all`. As duas chamadas compartilham um `AbortController`, evitando atualizar a tela se o usuário sair antes de elas terminarem.

Os botões de status são definidos pelo estado atual: uma solicitação aberta pode iniciar análise; uma solicitação em análise pode ser aprovada ou rejeitada; uma solicitação decidida não apresenta novas transições. O backend continua sendo a autoridade final dessas regras.

## Teste manual

- Abra a lista e compare com os registros da API.
- Pesquise parte de um título e clique em Aplicar filtros. Enter também funciona.
- Combine status e prioridade; limpe e confirme o retorno dos registros.
- Inverta a ordenação e altere a quantidade por página.
- Com mais de 10 registros, navegue em Próxima/Anterior.
- Pesquise um termo inexistente para ver o estado vazio.
- Pare temporariamente o backend, aplique filtros e veja o erro. Reinicie e clique em Tentar novamente.
- Reduza a janela para conferir os cartões no celular.
- Cadastre uma solicitação e confirme o redirecionamento para os detalhes.
- Edite os campos e verifique a mensagem de sucesso.
- Inicie a análise, tente decidir sem comentário e depois registre uma decisão válida.
- Confira cada mudança no histórico.
- Cancele uma exclusão uma vez; depois confirme e verifique o retorno para a lista.
