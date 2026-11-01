import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { Role } from '../lib/firebase'

export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Memuat">
      <img src="/logo-unmul.png" alt="UNMUL Peduli" className="pulse-logo" width="72" height="72" />
    </div>
  )
}

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
