import { useState } from 'react'
import { login } from '../services/auth-service'

const TOKEN_STORAGE_KEY = 'burger-house:token'
const USER_STORAGE_KEY = 'burger-house:user'

export function useLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleEmailChange(event) {
    setEmail(event.target.value)
    setError('')
    setSuccessMessage('')
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value)
    setError('')
    setSuccessMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLoading) return

    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const result = await login({ email, password })

      sessionStorage.setItem(TOKEN_STORAGE_KEY, result.token)
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))
      setSuccessMessage(result.message ?? 'Login realizado com sucesso.')

      return result
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível realizar o login.',
      )

      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    password,
    error,
    successMessage,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  }
}
