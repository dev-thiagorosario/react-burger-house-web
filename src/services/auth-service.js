import { getJson, postJson } from './api-client.js'

function readUser(payload) {
  const user = payload?.data?.user
  if (payload?.success !== true || !user ||
    !['id', 'fullName', 'email', 'cep'].every((field) => typeof user[field] === 'string')) {
    throw new Error('O servidor retornou uma resposta de autenticação inválida.')
  }
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    cep: user.cep,
    isAdmin: user.isAdmin === true,
  }
}

export async function login(credentials) {
  const payload = await postJson('/login', credentials, 'Não foi possível realizar o login.')
  return { user: readUser(payload), message: payload.message }
}

export async function getCurrentUser() {
  const payload = await getJson('/auth/me', 'Não foi possível verificar sua sessão.')
  return readUser(payload)
}

export async function logout() {
  await postJson('/logout', {}, 'Não foi possível encerrar sua sessão. Tente novamente.')
}
