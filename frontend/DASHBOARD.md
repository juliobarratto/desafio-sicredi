# Dashboard — referência para estudar o código

O Dashboard usa dados reais do backend e segue a organização visual do protótipo B.

## Ordem de leitura

1. `src/app/(painel)/dashboard/page.tsx`: título, descrição, link de navegação e componente de resumo.
2. `src/features/dashboard/components/dashboard-resumo.tsx`: consulta os indicadores, controla carregamento/erro e fornece os dados aos componentes visuais.
3. `indicador-card.tsx`: recebe título, valor, descrição, destaque e cor do marcador por props.
4. `grafico-status.tsx`: recebe o resumo e desenha barras horizontais com uma escala comum.
5. `grafico-prioridade.tsx`: recebe as quantidades por prioridade e desenha três colunas.
6. `solicitacoes-recentes.tsx`: consulta a listagem paginada com limite de três itens e ordenação decrescente.
7. `src/features/solicitacoes/components/status-badge.tsx`: apresentação reutilizável dos quatro status.

Props configuram o componente; state guarda dados que mudam; useEffect inicia a consulta quando o componente é montado. A variável ativo desconsidera respostas de uma consulta cujo componente já saiu da tela. Os botões Tentar novamente iniciam outra consulta.

## Executar

Com o backend em localhost:3000, rode `npm run dev -- --port 3001` nesta pasta. Acesse http://localhost:3001/dashboard.

A rota de Solicitações mantém a base existente; a consulta completa e o CRUD dessa tela serão a próxima etapa.

## Aviso de hidratação com cz-shortcut-listen

Esse atributo não pertence ao projeto. A página foi verificada em um navegador isolado: sem a inserção do atributo, não ocorreu o aviso; inserindo o atributo no body antes da hidratação, o mesmo aviso foi reproduzido.

O atributo é associado à extensão ColorZilla. Para confirmar no navegador que apresentou o problema, desative essa extensão em localhost e recarregue a página. Uma janela anônima também pode ser usada, desde que a extensão não esteja autorizada nela.

O layout não usa suppressHydrationWarning para esconder diferenças. Referências: https://nextjs.org/docs/messages/react-hydration-error e https://github.com/vercel/next.js/issues/72031.
