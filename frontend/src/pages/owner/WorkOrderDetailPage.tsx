import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatApiError, getCustomerById, getMechanics } from '../../api/usersApi'
import { getVehicleById } from '../../api/vehiclesApi'
import {
  addWorkOrderItem,
  assignMechanic,
  cancelWorkOrder,
  completeWorkOrder,
  deleteWorkOrderItem,
  getWorkOrderById,
  moveWorkOrderToInProgress,
  moveWorkOrderToWaitingForApproval,
  updateWorkOrderItem,
} from '../../api/workOrdersApi'
import type { UserResponse } from '../../types/user'
import type { WorkOrderItemResponse, WorkOrderResponse } from '../../types/workOrder'
import { formatDateTime, formatOptional, shortId } from '../../utils/customerDetail'
import {
  buildItemRequest,
  emptyItemForm,
  itemToForm,
  validateItemForm,
  type WorkOrderItemFormState,
} from '../../utils/workOrderItemForm'
import {
  canModifyOrderItems,
  formatMoney,
  formatStatusLabel,
  mechanicOptionLabel,
  statusBadgeClass,
} from '../../utils/workOrderDisplay'

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-dl-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function WorkOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const [order, setOrder] = useState<WorkOrderResponse | null>(null)
  const [customerLabel, setCustomerLabel] = useState<string>('—')
  const [vehicleLabelText, setVehicleLabelText] = useState<string>('—')
  const [mechanics, setMechanics] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [addForm, setAddForm] = useState<WorkOrderItemFormState>(emptyItemForm())
  const [addError, setAddError] = useState<string | null>(null)
  const [addSaving, setAddSaving] = useState(false)

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<WorkOrderItemFormState>(emptyItemForm())
  const [editError, setEditError] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  const [mechanicId, setMechanicId] = useState('')
  const [mechanicError, setMechanicError] = useState<string | null>(null)
  const [mechanicSaving, setMechanicSaving] = useState(false)

  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSaving, setStatusSaving] = useState(false)

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setPageError(null)
    try {
      const orderData = await getWorkOrderById(orderId)
      setOrder(orderData)
      setMechanicId(orderData.assignedMechanicId ?? '')

      const [customerResult, vehicleResult] = await Promise.allSettled([
        getCustomerById(orderData.customerId),
        getVehicleById(orderData.vehicleId),
      ])

      if (customerResult.status === 'fulfilled') {
        setCustomerLabel(
          [customerResult.value.firstName, customerResult.value.lastName]
            .filter(Boolean)
            .join(' ') || customerResult.value.email,
        )
      } else {
        setCustomerLabel(shortId(orderData.customerId))
      }

      if (vehicleResult.status === 'fulfilled') {
        const v = vehicleResult.value
        const parts = [v.make, v.model, v.yearOfManufacture != null ? String(v.yearOfManufacture) : null]
        setVehicleLabelText(parts.filter(Boolean).join(' '))
      } else {
        setVehicleLabelText(shortId(orderData.vehicleId))
      }
    } catch (err) {
      setPageError(formatApiError(err))
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void loadOrder()
  }, [loadOrder])

  useEffect(() => {
    getMechanics()
      .then(setMechanics)
      .catch(() => setMechanics([]))
  }, [])

  async function handleAddItem(e: FormEvent) {
    e.preventDefault()
    if (!orderId) return
    setAddError(null)
    const validationError = validateItemForm(addForm)
    if (validationError) {
      setAddError(validationError)
      return
    }
    setAddSaving(true)
    try {
      setOrder(await addWorkOrderItem(orderId, buildItemRequest(addForm)))
      setAddForm(emptyItemForm())
    } catch (err) {
      setAddError(formatApiError(err))
    } finally {
      setAddSaving(false)
    }
  }

  function startEditItem(item: WorkOrderItemResponse) {
    setEditingItemId(item.id)
    setEditForm(itemToForm(item))
    setEditError(null)
  }

  function cancelEditItem() {
    setEditingItemId(null)
    setEditError(null)
  }

  async function handleEditItem(e: FormEvent) {
    e.preventDefault()
    if (!editingItemId) return
    setEditError(null)
    const validationError = validateItemForm(editForm)
    if (validationError) {
      setEditError(validationError)
      return
    }
    setEditSaving(true)
    try {
      setOrder(await updateWorkOrderItem(editingItemId, buildItemRequest(editForm)))
      setEditingItemId(null)
    } catch (err) {
      setEditError(formatApiError(err))
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDeleteItem(item: WorkOrderItemResponse) {
    if (!window.confirm(`Delete item "${item.title}"?`)) return
    setEditError(null)
    try {
      await deleteWorkOrderItem(item.id)
      await loadOrder()
    } catch (err) {
      setEditError(formatApiError(err))
    }
  }

  async function handleAssignMechanic(e: FormEvent) {
    e.preventDefault()
    if (!orderId) return
    setMechanicError(null)
    if (!mechanicId) {
      setMechanicError('Please select a mechanic.')
      return
    }
    setMechanicSaving(true)
    try {
      setOrder(await assignMechanic(orderId, { mechanicId }))
    } catch (err) {
      setMechanicError(formatApiError(err))
    } finally {
      setMechanicSaving(false)
    }
  }

  async function runStatusAction(action: () => Promise<WorkOrderResponse>) {
    setStatusError(null)
    setStatusSaving(true)
    try {
      setOrder(await action())
    } catch (err) {
      setStatusError(formatApiError(err))
    } finally {
      setStatusSaving(false)
    }
  }

  if (!orderId) {
    return <p className="form-error">Order ID is missing.</p>
  }

  const itemsEditable = order ? canModifyOrderItems(order.status) : false

  return (
    <div className="customer-detail-page">
      <p className="users-form-back">
        <Link to="/owner/work-orders">← Back to orders</Link>
      </p>

      <h1>Order Details</h1>

      {loading ? <p className="users-loading">Loading order…</p> : null}
      {pageError ? <p className="form-error">{pageError}</p> : null}

      {!loading && !pageError && order ? (
        <>
          <section className="detail-card">
            <h2>Order Summary</h2>
            <dl className="detail-dl">
              <SummaryRow label="Order ID" value={shortId(order.id)} />
              <SummaryRow label="Customer" value={customerLabel} />
              <SummaryRow label="Vehicle" value={vehicleLabelText} />
              <div className="detail-dl-row">
                <dt>Status</dt>
                <dd>
                  <span className={statusBadgeClass(order.status)}>
                    {formatStatusLabel(order.status)}
                  </span>
                </dd>
              </div>
              <SummaryRow
                label="Assigned mechanic"
                value={order.assignedMechanicName ?? '—'}
              />
              <SummaryRow label="Created" value={formatDateTime(order.createdAt)} />
              <SummaryRow label="Subtotal" value={formatMoney(order.subtotal)} />
              <SummaryRow label="VAT" value={formatMoney(order.vatAmount)} />
              <SummaryRow label="Total" value={formatMoney(order.total)} />
            </dl>
          </section>

          <section className="detail-card">
            <h2>Order Items</h2>

            {order.items.length === 0 ? (
              <p className="users-empty">No items yet.</p>
            ) : (
              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit price</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) =>
                      editingItemId === item.id ? (
                        <tr key={item.id}>
                          <td colSpan={6}>
                            <form onSubmit={handleEditItem} className="item-edit-form">
                              <div className="users-form-grid">
                                <label className="field">
                                  <span>Name *</span>
                                  <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, title: e.target.value }))
                                    }
                                    required
                                  />
                                </label>
                                <label className="field">
                                  <span>Quantity *</span>
                                  <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={editForm.quantity}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, quantity: e.target.value }))
                                    }
                                    required
                                  />
                                </label>
                                <label className="field users-form-field-wide">
                                  <span>Description</span>
                                  <input
                                    type="text"
                                    value={editForm.details}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, details: e.target.value }))
                                    }
                                  />
                                </label>
                                <label className="field">
                                  <span>Unit price *</span>
                                  <input
                                    type="number"
                                    min={0.01}
                                    step={0.01}
                                    value={editForm.unitPrice}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, unitPrice: e.target.value }))
                                    }
                                    required
                                  />
                                </label>
                              </div>
                              {editError ? <p className="form-error">{editError}</p> : null}
                              <div className="users-form-actions">
                                <button type="submit" className="btn-primary" disabled={editSaving}>
                                  {editSaving ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={cancelEditItem}
                                  disabled={editSaving}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>{formatOptional(item.details)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatMoney(item.unitPrice)}</td>
                          <td>{formatMoney(item.lineTotal)}</td>
                          <td>
                            {itemsEditable ? (
                              <div className="table-actions">
                                <button
                                  type="button"
                                  className="btn-link"
                                  onClick={() => startEditItem(item)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn-link btn-link-danger"
                                  onClick={() => void handleDeleteItem(item)}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {itemsEditable ? (
              <form onSubmit={handleAddItem} className="item-add-form">
                <h3>Add item</h3>
                <div className="users-form-grid">
                  <label className="field">
                    <span>Name *</span>
                    <input
                      type="text"
                      value={addForm.title}
                      onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Quantity *</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={addForm.quantity}
                      onChange={(e) => setAddForm((f) => ({ ...f, quantity: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="field users-form-field-wide">
                    <span>Description</span>
                    <input
                      type="text"
                      value={addForm.details}
                      onChange={(e) => setAddForm((f) => ({ ...f, details: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Unit price *</span>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={addForm.unitPrice}
                      onChange={(e) => setAddForm((f) => ({ ...f, unitPrice: e.target.value }))}
                      required
                    />
                  </label>
                </div>
                {addError ? <p className="form-error">{addError}</p> : null}
                <button type="submit" className="btn-primary" disabled={addSaving}>
                  {addSaving ? 'Adding…' : 'Add item'}
                </button>
              </form>
            ) : null}
          </section>

          <section className="detail-card">
            <h2>Assigned Mechanic</h2>
            {mechanics.length === 0 ? (
              <p className="users-empty">
                No mechanics available.{' '}
                <Link to="/owner/mechanics/new">Create a mechanic</Link> first.
              </p>
            ) : (
              <form onSubmit={handleAssignMechanic} className="mechanic-assign-form">
                <label className="field users-form-field-wide">
                  <span>Mechanic</span>
                  <select
                    value={mechanicId}
                    onChange={(e) => setMechanicId(e.target.value)}
                    disabled={mechanicSaving || order.status === 'DONE' || order.status === 'CANCELED'}
                  >
                    <option value="">Select mechanic…</option>
                    {mechanics.map((mechanic) => (
                      <option key={mechanic.id} value={mechanic.id}>
                        {mechanicOptionLabel(mechanic)}
                      </option>
                    ))}
                  </select>
                </label>
                {mechanicError ? <p className="form-error">{mechanicError}</p> : null}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    mechanicSaving || order.status === 'DONE' || order.status === 'CANCELED'
                  }
                >
                  {mechanicSaving ? 'Assigning…' : 'Assign mechanic'}
                </button>
              </form>
            )}
          </section>

          <section className="detail-card">
            <h2>Order Workflow</h2>
            <p>
              Current status:{' '}
              <span className={statusBadgeClass(order.status)}>
                {formatStatusLabel(order.status)}
              </span>
            </p>

            {statusError ? <p className="form-error">{statusError}</p> : null}

            <WorkflowActions
              order={order}
              disabled={statusSaving}
              onWaitingForApproval={() =>
                runStatusAction(() => moveWorkOrderToWaitingForApproval(order.id))
              }
              onInProgress={() => runStatusAction(() => moveWorkOrderToInProgress(order.id))}
              onComplete={() => runStatusAction(() => completeWorkOrder(order.id))}
              onCancel={() => runStatusAction(() => cancelWorkOrder(order.id))}
            />
          </section>
        </>
      ) : null}
    </div>
  )
}

function WorkflowActions({
  order,
  disabled,
  onWaitingForApproval,
  onInProgress,
  onComplete,
  onCancel,
}: {
  order: WorkOrderResponse
  disabled: boolean
  onWaitingForApproval: () => void
  onInProgress: () => void
  onComplete: () => void
  onCancel: () => void
}) {
  const status = order.status

  if (status === 'DONE') {
    return <p className="users-empty">Order is completed.</p>
  }
  if (status === 'CANCELED') {
    return <p className="users-empty">Order is canceled.</p>
  }

  return (
    <div className="workflow-actions">
      {status === 'DRAFT' ? (
        <>
          <button type="button" className="btn-primary" disabled={disabled} onClick={onWaitingForApproval}>
            Send for approval
          </button>
          <button type="button" className="btn-secondary" disabled={disabled} onClick={onCancel}>
            Cancel
          </button>
        </>
      ) : null}
      {status === 'WAITING_FOR_APPROVAL' ? (
        <>
          <button type="button" className="btn-primary" disabled={disabled} onClick={onInProgress}>
            Start work
          </button>
          <button type="button" className="btn-secondary" disabled={disabled} onClick={onCancel}>
            Cancel
          </button>
        </>
      ) : null}
      {status === 'IN_PROGRESS' ? (
        <button type="button" className="btn-secondary" disabled={disabled} onClick={onCancel}>
          Cancel
        </button>
      ) : null}
      {status === 'READY' ? (
        <button type="button" className="btn-primary" disabled={disabled} onClick={onComplete}>
          Complete order
        </button>
      ) : null}
    </div>
  )
}
