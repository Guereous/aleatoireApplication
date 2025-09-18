import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Chargement...</div>
  }

  if (!user) {
    return fallback || (
      <div className="auth-required">
        <h2>Authentification requise</h2>
        <p>Vous devez vous connecter pour accéder à cette fonctionnalité.</p>
      </div>
    )
  }

  return <>{children}</>
}
