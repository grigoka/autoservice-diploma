import type { VehicleResponse } from '../types/vehicle'
import type { WorkOrderResponse, WorkOrderStatus } from '../types/workOrder'
import { WORK_ORDER_STATUSES } from '../types/workOrder'

const CURRENT_WORK_STATUSES: WorkOrderStatus[] = [
  'WAITING_FOR_APPROVAL',
  'IN_PROGRESS',
  'READY',
]

export function countOrdersByStatus(orders: WorkOrderResponse[]): Record<WorkOrderStatus, number> {
  const counts = Object.fromEntries(
    WORK_ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<WorkOrderStatus, number>

  for (const order of orders) {
    counts[order.status] += 1
  }

  return counts
}

export function countActiveOrders(orders: WorkOrderResponse[]): number {
  return orders.filter(
    (order) => order.status === 'WAITING_FOR_APPROVAL' || order.status === 'IN_PROGRESS',
  ).length
}

export function countReadyOrders(orders: WorkOrderResponse[]): number {
  return orders.filter((order) => order.status === 'READY').length
}

export function getCurrentWorkOrders(orders: WorkOrderResponse[]): WorkOrderResponse[] {
  return orders.filter((order) => CURRENT_WORK_STATUSES.includes(order.status))
}

export function getReadyOrders(orders: WorkOrderResponse[]): WorkOrderResponse[] {
  return orders.filter((order) => order.status === 'READY')
}

export function getUpcomingInspections(
  vehicles: VehicleResponse[],
  limit = 5,
): VehicleResponse[] {
  return vehicles
    .filter((vehicle) => vehicle.nextInspectionAt != null && vehicle.nextInspectionAt !== '')
    .sort(
      (a, b) =>
        new Date(a.nextInspectionAt!).getTime() - new Date(b.nextInspectionAt!).getTime(),
    )
    .slice(0, limit)
}
