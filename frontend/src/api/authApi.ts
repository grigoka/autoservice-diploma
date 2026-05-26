import type { CurrentUser, UserRole } from '../types/user'
import { apiClient } from './apiClient'

export interface LoginResponse {
  token: string
  role: UserRole
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password })
  return data
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>('/me')
  return data
}
