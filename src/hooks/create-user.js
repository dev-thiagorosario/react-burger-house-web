import { useState } from 'react'

import {
  CreateUserServiceError,
  createUser,
} from '../services/create-user-service'

function initialValues() {
  return {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cep: '',
  }
}

function formatCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits
}

function groupIssuesByField(issues) {
  return issues.reduce((fieldErrors, issue) => {
    fieldErrors[issue.field] = fieldErrors[issue.field]
      ? `${fieldErrors[issue.field]} ${issue.message}`
      : issue.message

    return fieldErrors
  }, {})
}

export function useCreateUser() {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name } = event.target
    const value = name === 'cep' ? formatCep(event.target.value) : event.target.value

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }

      delete nextErrors[name]

      if (name === 'password') {
        delete nextErrors.confirmPassword
      }

      return nextErrors
    })
    setRequestError('')
    setSuccessMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLoading) return null

    setFieldErrors({})
    setRequestError('')
    setSuccessMessage('')

    if (values.password !== values.confirmPassword) {
      setFieldErrors({
        confirmPassword: 'As senhas não coincidem.',
      })
      return null
    }

    setIsLoading(true)

    try {
      const result = await createUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        cep: values.cep,
      })

      setValues(initialValues())
      setSuccessMessage(result.message ?? 'Usuário criado com sucesso.')

      return result
    } catch (error) {
      if (error instanceof CreateUserServiceError && error.issues.length > 0) {
        setFieldErrors(groupIssuesByField(error.issues))
      } else {
        setRequestError(
          error instanceof Error
            ? error.message
            : 'Não foi possível criar sua conta.',
        )
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    values,
    fieldErrors,
    requestError,
    successMessage,
    isLoading,
    handleChange,
    handleSubmit,
  }
}
