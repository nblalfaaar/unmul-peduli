import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { Role } from '../lib/firebase'

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: Role }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Memuat…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}