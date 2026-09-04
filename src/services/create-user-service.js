import { ApiRequestError, postJson } from './api-client'

export { ApiRequestError as CreateUserServiceError }

export async function createUser(userData) {
  const payload = await postJson(
    '/register',
    userData,
    'Não foi possível criar sua conta.',
  )

  if (!payload?.data?.user) {
    throw new ApiRequestError(
      'O servidor retornou uma resposta de cadastro inválida.',
    )
  }

  return {
    user: payload.data.user,
    message: payload.message,
  }
}
