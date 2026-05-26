import type { WorkOrderItemRequest, WorkOrderItemResponse } from '../types/workOrder'

export interface WorkOrderItemFormState {
  title: string
  details: string
  quantity: string
  unitPrice: string
}

export const emptyItemForm = (): WorkOrderItemFormState => ({
  title: '',
  details: '',
  quantity: '1',
  unitPrice: '',
})

export function itemToForm(item: WorkOrderItemResponse): WorkOrderItemFormState {
  return {
    title: item.title,
    details: item.details ?? '',
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
  }
}

export function validateItemForm(form: WorkOrderItemFormState): string | null {
  if (!form.title.trim()) return 'Name is required.'

  const quantity = Number(form.quantity)
  if (!Number.isInteger(quantity) || quantity < 1) {
    return 'Quantity must be a whole number of at least 1.'
  }

  const unitPrice = Number(form.unitPrice)
  if (!Number.isFinite(unitPrice) || unitPrice < 0.01) {
    return 'Unit price must be at least 0.01.'
  }

  return null
}

export function buildItemRequest(form: WorkOrderItemFormState): WorkOrderItemRequest {
  const request: WorkOrderItemRequest = {
    title: form.title.trim(),
    quantity: Number(form.quantity),
    unitPrice: Number(form.unitPrice),
  }

  const details = form.details.trim()
  if (details) request.details = details

  return request
}
