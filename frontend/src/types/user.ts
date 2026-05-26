export type UserRole = 'OWNER' | 'CUSTOMER' | 'MECHANIC'

export type CreatableUserRole = 'CUSTOMER' | 'MECHANIC'

export interface UserResponse {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  zip: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  role: CreatableUserRole
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  zip?: string
}

export interface UpdateUserRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  zip?: string
}

export type CurrentUser = UserResponse
