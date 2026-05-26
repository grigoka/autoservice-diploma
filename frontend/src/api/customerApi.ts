import { apiClient } from './apiClient'
import type { VehicleResponse } from '../types/vehicle'
import type { WorkOrderResponse } from '../types/workOrder'

export async function getMyVehicles(): Promise<VehicleResponse[]> {
  const { data } = await apiClient.get<VehicleResponse[]>('/me/vehicles')
  return data
}

export async function getMyWorkOrders(): Promise<WorkOrderResponse[]> {
  const { data } = await apiClient.get<WorkOrderResponse[]>('/me/work-orders')
  return data
}

export async function getMyWorkOrderById(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.get<WorkOrderResponse>(`/me/work-orders/${orderId}`)
  return data
}
