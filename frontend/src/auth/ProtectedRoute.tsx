import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/auth'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { user, bootstrapping } = useAuth()
  const location = useLocation()
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (bootstrapping) {
    return (
      <div className="app-loading">
        <p>Loading…</p>
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
