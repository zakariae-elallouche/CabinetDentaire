import { memo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = memo(function ProtectedRoute({ children, roles }) {
  const { user, token, tenantStatut } = useAuth()

  if (!token) {
    return <Navigate to="/login" />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/login" />
  }

  if (token && user?.role !== 'SUPERADMIN' && tenantStatut && !['essai', 'actif'].includes(tenantStatut)) {
    return <Navigate to="/subscription-blocked" />
  }

  return children
})

export default ProtectedRoute
