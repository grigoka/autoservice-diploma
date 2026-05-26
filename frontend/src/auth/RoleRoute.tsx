import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../types/user'
import { useAuth } from './useAuth'
import { homePathForRole } from './authPaths'

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return <Outlet />
}
