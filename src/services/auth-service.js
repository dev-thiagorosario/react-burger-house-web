import { postJson } from './api-client'

export async function login(credentials) {
  const payload = await postJson(
    '/login',
    credentials,
    'Não foi possível realizar o login.',
  )

  if (!payload?.data?.token || !payload.data.user) {
    throw new Error('O servidor retornou uma resposta de login inválida.')
  }

  return {
    token: payload.data.token,
    user: payload.data.user,
    message: payload.message,
  }
}
