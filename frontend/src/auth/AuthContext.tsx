import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCurrentUser, login as loginRequest } from '../api/authApi'
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/auth'
import type { CurrentUser } from '../types/user'
import { AuthContext } from './context'
import { homePathForRole } from './authPaths'

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      setBootstrapping(false)
      return
    }

    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
        setUser(null)
      })
      .finally(() => setBootstrapping(false))
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { token } = await loginRequest(email, password)
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)

      try {
        const me = await fetchCurrentUser()
        setUser(me)
        navigate(homePathForRole(me.role), { replace: true })
      } catch (err) {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
        setUser(null)
        throw err
      }
    },
    [navigate],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      login,
      logout,
    }),
    [user, bootstrapping, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
