import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/authContext'

interface Props {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="screen-center">Cargando…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
