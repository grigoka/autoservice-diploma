import { apiClient } from './apiClient'
import type {
  AssignMechanicRequest,
  CreateWorkOrderRequest,
  WorkOrderItemRequest,
  WorkOrderListFilters,
  WorkOrderResponse,
} from '../types/workOrder'

export async function getWorkOrders(
  filters?: WorkOrderListFilters,
): Promise<WorkOrderResponse[]> {
  const { data } = await apiClient.get<WorkOrderResponse[]>('/work-orders', {
    params: filters,
  })
  return data
}

export async function getWorkOrderById(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.get<WorkOrderResponse>(`/work-orders/${orderId}`)
  return data
}

export async function createWorkOrder(request: CreateWorkOrderRequest): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>('/work-orders', request)
  return data
}

export async function addWorkOrderItem(
  orderId: string,
  request: WorkOrderItemRequest,
): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(
    `/work-orders/${orderId}/items`,
    request,
  )
  return data
}

export async function updateWorkOrderItem(
  itemId: string,
  request: WorkOrderItemRequest,
): Promise<WorkOrderResponse> {
  const { data } = await apiClient.put<WorkOrderResponse>(`/work-orders/items/${itemId}`, request)
  return data
}

export async function deleteWorkOrderItem(itemId: string): Promise<void> {
  await apiClient.delete(`/work-orders/items/${itemId}`)
}

export async function moveWorkOrderToWaitingForApproval(
  orderId: string,
): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(
    `/work-orders/${orderId}/status/waiting-for-approval`,
  )
  return data
}

export async function moveWorkOrderToInProgress(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(
    `/work-orders/${orderId}/status/in-progress`,
  )
  return data
}

export async function completeWorkOrder(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(`/work-orders/${orderId}/status/done`)
  return data
}

export async function cancelWorkOrder(orderId: string): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(`/work-orders/${orderId}/status/cancel`)
  return data
}

export async function assignMechanic(
  orderId: string,
  request: AssignMechanicRequest,
): Promise<WorkOrderResponse> {
  const { data } = await apiClient.post<WorkOrderResponse>(
    `/work-orders/${orderId}/assign-mechanic`,
    request,
  )
  return data
}

export async function getCustomerWorkOrders(customerId: string): Promise<WorkOrderResponse[]> {
  const { data } = await apiClient.get<WorkOrderResponse[]>(
    `/customers/${customerId}/work-orders`,
  )
  return data
}

export async function getVehicleWorkOrders(vehicleId: string): Promise<WorkOrderResponse[]> {
  const { data } = await apiClient.get<WorkOrderResponse[]>(`/vehicles/${vehicleId}/work-orders`)
  return data
}
