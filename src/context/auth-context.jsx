import { createContext, useEffect, useRef, useState } from 'react'
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../services/auth-service'

/**
 * @typedef {Awaited<ReturnType<typeof getCurrentUser>>} User
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {boolean} loading
 * @property {string} sessionError
 * @property {() => void} retrySession
 * @property {(credentials: {email: string, password: string}) => ReturnType<typeof loginRequest>} login
 * @property {() => Promise<void>} logout
 */

export const AuthContext = createContext(
  /** @type {AuthState | undefined} */ (undefined),
)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    /** @type {Awaited<ReturnType<typeof getCurrentUser>> | null} */ (null),
  )
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const sessionVersion = useRef(0)

  useEffect(() => {
    let active = true
    const version = ++sessionVersion.current

    // Remove dados persistidos pela implementação anterior.
    try {
      sessionStorage.removeItem('burger-house:token')
      sessionStorage.removeItem('burger-house:user')
    } catch {
      // A sessão por cookie também funciona com Web Storage indisponível.
    }

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser()
        if (active && version === sessionVersion.current) setUser(currentUser)
      } catch (error) {
        if (active && version === sessionVersion.current) {
          setUser(null)
          setSessionError(error.status === 401 ? '' : error.message)
        }
      } finally {
        if (active && version === sessionVersion.current) setLoading(false)
      }
    }

    restoreSession()
    return () => { active = false }
  }, [sessionAttempt])

  function retrySession() {
    setSessionError('')
    setLoading(true)
    setSessionAttempt((attempt) => attempt + 1)
  }

  async function login(credentials) {
    const result = await loginRequest(credentials)
    ++sessionVersion.current
    setUser(result.user)
    setSessionError('')
    setLoading(false)
    return result
  }

  async function logout() {
    await logoutRequest()
    ++sessionVersion.current
    setUser(null)
    setSessionError('')
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, sessionError, retrySession, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
