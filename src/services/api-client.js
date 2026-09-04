const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080')
  .replace(/\/$/, '')

export class ApiRequestError extends Error {
  constructor(message, issues = []) {
    super(message)
    this.name = 'ApiRequestError'
    this.issues = issues
  }
}

function getIssues(payload) {
  if (!Array.isArray(payload?.errors)) return []

  return payload.errors.filter(
    (issue) =>
      typeof issue?.field === 'string' && typeof issue?.message === 'string',
  )
}

function getErrorMessage(payload, issues, fallbackMessage) {
  if (issues.length > 0) {
    return issues.map(({ message }) => message).join(' ')
  }

  return payload?.message ?? fallbackMessage
}

export async function postJson(path, body, fallbackMessage) {
  let response

  try {
    response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiRequestError(
      'Não foi possível conectar ao servidor. Tente novamente em instantes.',
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const issues = getIssues(payload)

    throw new ApiRequestError(
      getErrorMessage(payload, issues, fallbackMessage),
      issues,
    )
  }

  return payload
}
