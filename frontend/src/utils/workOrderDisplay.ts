import type { UserResponse } from '../types/user'
import type { VehicleResponse } from '../types/vehicle'
import type { WorkOrderResponse, WorkOrderStatus } from '../types/workOrder'
import { displayName, shortId, vehicleLabel } from './customerDetail'

export function formatMoney(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function statusBadgeClass(status: WorkOrderStatus): string {
  return `status-badge status-badge-${status.toLowerCase().replace(/_/g, '-')}`
}

export function formatStatusLabel(status: WorkOrderStatus): string {
  return status.replace(/_/g, ' ')
}

export function customerLabel(
  customerId: string,
  customerById: Map<string, UserResponse>,
): string {
  const customer = customerById.get(customerId)
  return customer ? displayName(customer) : shortId(customerId)
}

export function orderVehicleLabel(
  vehicleId: string,
  vehicleById: Map<string, VehicleResponse>,
): string {
  const vehicle = vehicleById.get(vehicleId)
  return vehicle ? vehicleLabel(vehicle) : shortId(vehicleId)
}

export function vehicleOptionLabel(vehicle: VehicleResponse): string {
  const parts = [vehicleLabel(vehicle)]
  if (vehicle.licensePlate?.trim()) parts.push(vehicle.licensePlate.trim())
  if (vehicle.vin?.trim()) parts.push(`VIN ${vehicle.vin.trim()}`)
  return parts.join(' · ')
}

export function customerOptionLabel(customer: UserResponse): string {
  return `${displayName(customer)} (${customer.email})`
}

export function mechanicOptionLabel(mechanic: UserResponse): string {
  return `${displayName(mechanic)} (${mechanic.email})`
}

export function canModifyOrderItems(status: WorkOrderStatus): boolean {
  return status !== 'DONE' && status !== 'CANCELED'
}

export function orderMatchesSearch(
  order: WorkOrderResponse,
  query: string,
  customerById: Map<string, UserResponse>,
  vehicleById: Map<string, VehicleResponse>,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    order.id,
    shortId(order.id),
    customerLabel(order.customerId, customerById),
    orderVehicleLabel(order.vehicleId, vehicleById),
    order.assignedMechanicName,
    order.status,
    formatStatusLabel(order.status),
    String(order.total),
  ]
    .filter((part) => part != null && String(part).trim() !== '')
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function assignedOrderMatchesSearch(order: WorkOrderResponse, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    order.id,
    shortId(order.id),
    order.customerId,
    shortId(order.customerId),
    order.vehicleId,
    shortId(order.vehicleId),
    order.status,
    formatStatusLabel(order.status),
    String(order.total),
  ]
    .filter((part) => part != null && String(part).trim() !== '')
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}
