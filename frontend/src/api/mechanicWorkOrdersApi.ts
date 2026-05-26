import { apiClient } from './apiClient'
import type { WorkOrderResponse } from '../types/workOrder'

export async function getAssignedWorkOrders(): Promise<WorkOrderResponse[]> {
  const { data } = await apiClient.get<WorkOrderResponse[]>('/me/assigned-work-orders')
  return data
}

export async function getAssignedWorkOrderById(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.get<WorkOrderResponse>(`/me/assigned-work-orders/${orderId}`)
  return data
}

export async function mechanicStartWork(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(
    `/me/assigned-work-orders/${orderId}/status/in-progress`,
  )
  return data
}

export async function mechanicMarkReady(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(
    `/me/assigned-work-orders/${orderId}/status/ready`,
  )
  return data
}
