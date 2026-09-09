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

- O cliente HTTP envia `credentials: 'include'` em GET e POST.
- `POST /login` recebe `{ email, password }` e retorna `{ success: true, data: { user }, message }`. O navegador gerencia o cookie enviado pelo servidor.
- `AuthProvider` guarda apenas os dados públicos do usuário em memória. `useAuth()` expõe `user`, `loading`, `sessionError`, `retrySession` e `login(credentials)`.
- Ao iniciar, `GET /auth/me` restaura a sessão. `401` significa sessão ausente ou expirada; outros erros exibem uma opção de tentar novamente na tela de login.
- A tela de login aguarda a restauração e mostra uma confirmação quando o usuário está autenticado.
- O frontend não lê o cookie nem armazena JWT. As antigas chaves `burger-house:token` e `burger-house:user` são removidas do sessionStorage na inicialização.
- O botão Sair chama `POST /logout` e limpa o usuário do contexto apenas após uma resposta HTTP de sucesso. O backend precisa implementar esse endpoint e invalidar o cookie da sessão. Falhas mantêm o usuário autenticado e exibem uma mensagem na página Home.

## Header

- As ações ficam em uma segunda linha em telas menores e na mesma linha em telas grandes, com nomes longos truncados e controles acessíveis por teclado.
- O Header é um componente de apresentação: recebe `userName`, `homePath`, `isLoggingOut` e callbacks `onCreateClick` e `onLogoutClick`. Os links de Cardápio, Pedidos e Carrinho apontam para `/cardapio`, `/pedidos` e `/carrinhos`, respectivamente. Botões sem callback ficam desabilitados.
- A página Home fornece os dados de autenticação e controla a saída e seus erros. O Header não acessa o contexto de autenticação nem gerencia diálogos ou requisições.

## Validar com o backend

1. Abra `/login` sem cookie: `/auth/me` deve responder 401 e o formulário aparecer.
2. Faça login: confirme 200 e `Set-Cookie` no painel Network do navegador; a tela deve mostrar seu nome.
3. Recarregue: `/auth/me` deve enviar o cookie e restaurar o usuário.
4. Remova o cookie pelas ferramentas do navegador e recarregue: o formulário deve voltar.
5. Com o backend indisponível, recarregue: deve aparecer o erro com opção de tentar novamente.

Use `localhost` consistentemente no frontend e no backend durante o desenvolvimento.

## Verificações

```sh
npm run build
npm run lint
node --test tests/auth-service.test.js
```

Os testes usam respostas HTTP simuladas e verificam os contratos, credentials, erros e dados públicos; a aceitação real do cookie e o CORS precisam ser validados no navegador com o backend ativo.
