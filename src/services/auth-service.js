const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080')
  .replace(/\/$/, '')

function getErrorMessage(payload) {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors.map(({ message }) => message).join(' ')
  }

  return payload?.message ?? 'Não foi possível realizar o login.'
}

export async function login(credentials) {
  let response

  try {
    response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Tente novamente em instantes.',
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(payload))
  }

  if (!payload?.data?.token || !payload.data.user) {
    throw new Error('O servidor retornou uma resposta de login inválida.')
  }

  return {
    token: payload.data.token,
    user: payload.data.user,
    message: payload.message,
  }
}
