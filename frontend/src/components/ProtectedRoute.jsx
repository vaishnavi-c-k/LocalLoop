import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Wrap any page that needs login. Optionally pass roles={['provider']}
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="center-msg">Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return children
}
