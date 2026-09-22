# Burger House — Frontend

Frontend React integrado à Burger House API com autenticação por cookie HttpOnly.

## Executar

```sh
npm install
cp .env.example .env
npm run dev -- --port 5173 --strictPort
```

Configure `VITE_API_URL` no `.env` com a URL do backend (padrão: `http://localhost:8080`). Abra `http://localhost:5173`, origem autorizada pelo CORS informado. Reinicie o Vite após alterar o `.env`.

## Autenticação

- O cliente HTTP envia `credentials: 'include'` em todas as requisições, incluindo POST e PATCH de pedidos.
- `POST /login` recebe `{ email, password }` e retorna `{ success: true, data: { user }, message }`. O navegador gerencia o cookie enviado pelo servidor.
- `AuthProvider` guarda apenas os dados públicos do usuário em memória. `useAuth()` expõe `user`, `loading`, `sessionError`, `retrySession` e `login(credentials)`.
- Ao iniciar, `GET /auth/me` restaura a sessão. `401` significa sessão ausente ou expirada; outros erros exibem uma opção de tentar novamente na tela de login.
- A tela de login aguarda a restauração e mostra uma confirmação quando o usuário está autenticado.
- O frontend não lê o cookie nem armazena JWT. As antigas chaves `burger-house:token` e `burger-house:user` são removidas do sessionStorage na inicialização.
- O botão Sair chama `POST /logout` e limpa o usuário do contexto apenas após uma resposta HTTP de sucesso. O backend precisa implementar esse endpoint e invalidar o cookie da sessão. Falhas mantêm o usuário autenticado e exibem uma mensagem na página Home.

## Cardápio

- A página consulta `GET /list-products` e lê `{ success: true, data: { products: [...] } }`.
- Exibe somente produtos com `isActive: true`, agrupados por `categoryId`. IDs e nomes das categorias vêm de `GET /list-categories`; produtos com categoria ausente nessa lista aparecem em “Categoria N”.
- Os cards usam `name`, `description`, `price` (em reais), `imageAlt` e as URLs de `images[]`, selecionadas por `variant: desktop | mobile`. O formato anterior com `imageUrl` e `mobileImageUrl` também é aceito.
- URLs de imagens absolutas são preservadas; caminhos relativos são resolvidos contra `VITE_API_URL`. O backend deve servir esses arquivos estáticos.
- Há estados de carregamento, cardápio/categoria vazia e erro com botão para tentar novamente.
- Administradores podem editar e excluir produtos pela API. O formulário de cadastro de produtos ainda não envia os dados ao backend.

## Header e carrinho

- Pedidos e Carrinho ficam disponíveis para todos os usuários autenticados; as ações de administração de produtos continuam restritas aos administradores.
- O carrinho abre em um painel lateral responsivo, sem navegar para uma rota. Fecha pelo botão, pela tecla Escape ou pelo fundo; mantém o foco dentro do painel e bloqueia a rolagem da página enquanto aberto.
- A seleção de produtos e quantidades é mantida em memória por `CartProvider`, preservada entre páginas e descartada ao recarregar ou trocar de usuário. A API disponível não persiste um carrinho antes da compra.
- `POST /cart/summary` recebe `{ items: [{ productId, quantity }] }` a cada alteração e ao abrir o carrinho. Preços, subtotais e total vêm da resposta `{ success: true, data: { items, totalItems, total } }`. Respostas de seleções anteriores são ignoradas; enquanto o resumo está pendente ou com erro, a finalização fica bloqueada.
- `POST /create-order` envia somente os IDs e quantidades. O carrinho bloqueia novos envios enquanto aguarda a resposta, preserva a seleção em caso de erro e a limpa apenas após `{ success: true, data: { order } }`. A confirmação mostra o número do pedido e o acesso à listagem.

## Pedidos

- `/pedidos` consulta `GET /orders`, que retorna `{ success: true, data: { orders } }`. `/list-orders` é um alias do mesmo endpoint no backend; o frontend utiliza somente a rota canônica para evitar consultas duplicadas.
- Clientes veem seus próprios pedidos e administradores veem todos, conforme a autorização aplicada pelo backend.
- `GET /list-order-statuses` fornece `{ success: true, data: { statuses: [{ id, name }] } }`. Filtros e opções usam os IDs retornados pela API.
- Administradores podem alterar pedidos pendentes usando `PATCH /update-order-status/:id` com `{ statusId }`. O card só muda após a confirmação do servidor; pedidos retirados ou cancelados não oferecem novas alterações.
- Nome do cliente, itens, preços, subtotais, total e datas vêm do pedido retornado pela API. Não há pedidos ou horários de exemplo na interface.
- A listagem possui carregamento, estado vazio, erro e nova tentativa; também é atualizada após criar um pedido pelo carrinho.

## Validar com o backend

1. Abra `/login` sem cookie: `/auth/me` deve responder 401 e o formulário aparecer.
2. Faça login: confirme 200 e `Set-Cookie` no painel Network do navegador; a tela deve mostrar seu nome.
3. Recarregue: `/auth/me` deve enviar o cookie e restaurar o usuário.
4. Remova o cookie pelas ferramentas do navegador e recarregue: o formulário deve voltar.
5. Com o backend indisponível, recarregue: deve aparecer o erro com opção de tentar novamente.
6. Adicione produtos, altere quantidades e abra o carrinho: confirme `/cart/summary` e os valores calculados pelo servidor.
7. Finalize: confirme um único `POST /create-order`, o número retornado e a presença do pedido em `/pedidos`. Uma falha deve preservar o carrinho.
8. Como administrador, altere um pedido pendente para retirado ou cancelado e recarregue a página para conferir a persistência. Como cliente, confirme a listagem dos próprios pedidos sem controles de edição.

Use `localhost` consistentemente no frontend e no backend durante o desenvolvimento.

## Verificações

```sh
npm run build
npm run lint
node --test tests/*.test.js
```

Os testes usam respostas HTTP simuladas e verificam os contratos, credentials, erros e dados públicos; a aceitação real do cookie e o CORS precisam ser validados no navegador com o backend ativo.
