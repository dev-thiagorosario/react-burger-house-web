import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/use-auth'
import Button from './Button'

export default function AuthRoute({ guestOnly = false }) {
  const { user, loading, sessionError, retrySession } = useAuth()

  if (loading) {
    return <p role="status" className="p-6 text-[#F2DAAC]">Verificando sua sessão...</p>
  }

  if (sessionError) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-[#F2DAAC]">
        <p role="alert">{sessionError}</p>
        <Button onClick={retrySession}>Tentar novamente</Button>
      </div>
    )
  }

  if (guestOnly && user) return <Navigate to="/home" replace />
  if (!guestOnly && !user) return <Navigate to="/login" replace />

  return <Outlet />
}
