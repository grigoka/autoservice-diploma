import type { WorkOrderStatus } from '../types/workOrder'

export function customerStatusMessage(status: WorkOrderStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'The order has been created and is being prepared.'
    case 'WAITING_FOR_APPROVAL':
      return 'The order is waiting for approval.'
    case 'IN_PROGRESS':
      return 'Your vehicle is currently being serviced.'
    case 'READY':
      return 'Your vehicle is ready for pickup.'
    case 'DONE':
      return 'The order has been completed.'
    case 'CANCELED':
      return 'The order has been canceled.'
    default:
      return ''
  }
}
