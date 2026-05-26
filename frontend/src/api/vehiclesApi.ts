import { apiClient } from './apiClient'
import type {
  CreateVehicleRequest,
  UpdateInspectionDateRequest,
  VehicleResponse,
} from '../types/vehicle'

export async function getVehicles(): Promise<VehicleResponse[]> {
  const { data } = await apiClient.get<VehicleResponse[]>('/vehicles')
  return data
}

export async function getVehicleById(vehicleId: string): Promise<VehicleResponse> {
  const { data } = await apiClient.get<VehicleResponse>(`/vehicles/${vehicleId}`)
  return data
}

export async function updateVehicleInspectionDate(
  vehicleId: string,
  request: UpdateInspectionDateRequest,
): Promise<VehicleResponse> {
  const { data } = await apiClient.put<VehicleResponse>(
    `/vehicles/${vehicleId}/inspection-date`,
    request,
  )
  return data
}

export async function getCustomerVehicles(customerId: string): Promise<VehicleResponse[]> {
  const { data } = await apiClient.get<VehicleResponse[]>(`/customers/${customerId}/vehicles`)
  return data
}

export async function createCustomerVehicle(
  customerId: string,
  request: CreateVehicleRequest,
): Promise<VehicleResponse> {
  const { data } = await apiClient.post<VehicleResponse>(
    `/customers/${customerId}/vehicles`,
    request,
  )
  return data
}
