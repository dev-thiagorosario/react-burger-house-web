import { useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../hooks/use-auth'

const Home = () => {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setLogoutError('')

    try {
      await logout()
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Não foi possível sair. Tente novamente.',
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <Header
        userName={user?.fullName}
        onLogoutClick={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      {logoutError && (
        <p role="alert" className="mx-auto max-w-6xl px-4 py-3 text-sm text-red-300 sm:px-6 lg:px-8">
          {logoutError}
        </p>
      )}
    </>
  )
}

export default Home
