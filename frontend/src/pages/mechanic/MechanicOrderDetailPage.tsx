import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatApiError } from '../../api/usersApi'
import {
  getAssignedWorkOrderById,
  mechanicMarkReady,
  mechanicStartWork,
} from '../../api/mechanicWorkOrdersApi'
import type { WorkOrderResponse } from '../../types/workOrder'
import { formatDateTime, formatOptional, shortId } from '../../utils/customerDetail'
import { formatMoney, formatStatusLabel, statusBadgeClass } from '../../utils/workOrderDisplay'

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-dl-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function MechanicOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const [order, setOrder] = useState<WorkOrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [workflowError, setWorkflowError] = useState<string | null>(null)
  const [workflowSaving, setWorkflowSaving] = useState(false)
  const [workflowSuccess, setWorkflowSuccess] = useState<string | null>(null)

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setPageError(null)
    try {
      setOrder(await getAssignedWorkOrderById(orderId))
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

  async function runWorkflow(
    action: () => Promise<WorkOrderResponse>,
    successMessage: string,
  ) {
    setWorkflowError(null)
    setWorkflowSuccess(null)
    setWorkflowSaving(true)
    try {
      setOrder(await action())
      setWorkflowSuccess(successMessage)
    } catch (err) {
      setWorkflowError(formatApiError(err))
    } finally {
      setWorkflowSaving(false)
    }
  }

  if (!orderId) {
    return <p className="form-error">Order ID is missing.</p>
  }

  return (
    <div className="customer-detail-page">
      <p className="users-form-back">
        <Link to="/mechanic/orders">← Back to my orders</Link>
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
              <SummaryRow label="Customer" value={shortId(order.customerId)} />
              <SummaryRow label="Vehicle" value={shortId(order.vehicleId)} />
              <div className="detail-dl-row">
                <dt>Status</dt>
                <dd>
                  <span className={statusBadgeClass(order.status)}>
                    {formatStatusLabel(order.status)}
                  </span>
                </dd>
              </div>
              <SummaryRow label="Total" value={formatMoney(order.total)} />
              <SummaryRow label="Created" value={formatDateTime(order.createdAt)} />
            </dl>
          </section>

          <section className="detail-card">
            <h2>Order Items</h2>
            {order.items.length === 0 ? (
              <p className="users-empty">No items on this order.</p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{formatOptional(item.details)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatMoney(item.unitPrice)}</td>
                        <td>{formatMoney(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="detail-card">
            <h2>Workflow</h2>
            <p>
              Current status:{' '}
              <span className={statusBadgeClass(order.status)}>
                {formatStatusLabel(order.status)}
              </span>
            </p>

            {workflowSuccess ? <p className="form-success">{workflowSuccess}</p> : null}
            {workflowError ? <p className="form-error">{workflowError}</p> : null}

            <MechanicWorkflow
              order={order}
              disabled={workflowSaving}
              onStartWork={() =>
                runWorkflow(() => mechanicStartWork(order.id), 'Work started.')
              }
              onMarkReady={() =>
                runWorkflow(() => mechanicMarkReady(order.id), 'Order marked as ready.')
              }
            />
          </section>
        </>
      ) : null}
    </div>
  )
}

function MechanicWorkflow({
  order,
  disabled,
  onStartWork,
  onMarkReady,
}: {
  order: WorkOrderResponse
  disabled: boolean
  onStartWork: () => void
  onMarkReady: () => void
}) {
  switch (order.status) {
    case 'DRAFT':
      return <p className="users-empty">This order is not ready for mechanic work yet.</p>
    case 'WAITING_FOR_APPROVAL':
      return (
        <div className="workflow-actions">
          <button type="button" className="btn-primary" disabled={disabled} onClick={onStartWork}>
            Start work
          </button>
        </div>
      )
    case 'IN_PROGRESS':
      return (
        <div className="workflow-actions">
          <button type="button" className="btn-primary" disabled={disabled} onClick={onMarkReady}>
            Mark as ready
          </button>
        </div>
      )
    case 'READY':
      return <p className="users-empty">Order is ready for pickup.</p>
    case 'DONE':
      return <p className="users-empty">Order is completed.</p>
    case 'CANCELED':
      return <p className="users-empty">Order is canceled.</p>
    default:
      return null
  }
}
