import { createContext } from 'react'
import type { CurrentUser } from '../types/user'

export interface AuthContextValue {
  user: CurrentUser | null
  bootstrapping: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
