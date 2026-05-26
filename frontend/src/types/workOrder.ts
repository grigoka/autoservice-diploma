export type WorkOrderStatus =
  | 'DRAFT'
  | 'WAITING_FOR_APPROVAL'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DONE'
  | 'CANCELED'

export const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  'DRAFT',
  'WAITING_FOR_APPROVAL',
  'IN_PROGRESS',
  'READY',
  'DONE',
  'CANCELED',
]

export interface CreateWorkOrderRequest {
  customerId: string
  vehicleId: string
}

export interface WorkOrderListFilters {
  status?: WorkOrderStatus
  customerId?: string
  vehicleId?: string
  mechanicId?: string
}

export interface WorkOrderItemRequest {
  title: string
  details?: string
  quantity: number
  unitPrice: number
}

export interface WorkOrderItemResponse {
  id: string
  title: string
  details: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
  createdAt: string
  updatedAt: string
}

export interface AssignMechanicRequest {
  mechanicId: string
}

export interface WorkOrderResponse {
  id: string
  customerId: string
  vehicleId: string
  assignedMechanicId: string | null
  assignedMechanicName: string | null
  status: WorkOrderStatus
  vatRate: number
  subtotal: number
  vatAmount: number
  total: number
  items: WorkOrderItemResponse[]
  createdAt: string
  updatedAt: string
}
