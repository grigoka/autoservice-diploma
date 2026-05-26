import axios from 'axios'
import { apiClient } from './apiClient'
import type { CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user'

export interface ApiErrorBody {
  status?: number
  message?: string
  timestamp?: string
  errors?: Record<string, string>
}

export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorBody
    if (data.errors && Object.keys(data.errors).length > 0) {
      return Object.entries(data.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('; ')
    }
    if (data.message) {
      if (data.message === 'An unexpected error occurred') {
        return 'Server error loading users. Stop the backend, run mvn compile and mvn spring-boot:run, then reload this page.'
      }
      return data.message
    }
  }
  return 'Something went wrong. Please try again.'
}

export async function createUser(request: CreateUserRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>('/users', request)
  return data
}

export async function getCustomers(): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>('/customers')
  return data
}

export async function getMechanics(): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>('/mechanics')
  return data
}

export async function getCustomerById(customerId: string): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>(`/customers/${customerId}`)
  return data
}

export async function updateCustomer(
  customerId: string,
  request: UpdateUserRequest,
): Promise<UserResponse> {
  const { data } = await apiClient.put<UserResponse>(`/customers/${customerId}`, request)
  return data
}
