import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMyVehicles, getMyWorkOrderById } from '../../api/customerApi'
import { formatApiError } from '../../api/usersApi'
import type { VehicleResponse } from '../../types/vehicle'
import type { WorkOrderResponse } from '../../types/workOrder'
import {
  formatDateTime,
  formatOptional,
  shortId,
  vehicleLabel,
} from '../../utils/customerDetail'
import { customerStatusMessage } from '../../utils/customerWorkOrder'
import { formatMoney, formatStatusLabel, statusBadgeClass } from '../../utils/workOrderDisplay'

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-dl-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function CustomerWorkOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const [order, setOrder] = useState<WorkOrderResponse | null>(null)
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setPageError(null)
    try {
      const [orderData, vehiclesData] = await Promise.all([
        getMyWorkOrderById(orderId),
        getMyVehicles(),
      ])
      setOrder(orderData)
      setVehicles(vehiclesData)
    } catch (err) {
      setPageError(formatApiError(err))
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const vehicleById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  )

  const vehicleLabelText = order
    ? vehicleById.has(order.vehicleId)
      ? vehicleLabel(vehicleById.get(order.vehicleId)!)
      : shortId(order.vehicleId)
    : '—'

  if (!orderId) {
    return <p className="form-error">Order ID is missing.</p>
  }

  return (
    <div className="customer-detail-page">
      <p className="users-form-back">
        <Link to="/customer/portal">← Back to portal</Link>
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
              <SummaryRow label="Vehicle" value={vehicleLabelText} />
              <div className="detail-dl-row">
                <dt>Status</dt>
                <dd>
                  <span className={statusBadgeClass(order.status)}>
                    {formatStatusLabel(order.status)}
                  </span>
                </dd>
              </div>
              <SummaryRow label="Created" value={formatDateTime(order.createdAt)} />
              <SummaryRow label="Subtotal" value={formatMoney(order.subtotal)} />
              <SummaryRow label="VAT" value={formatMoney(order.vatAmount)} />
              <SummaryRow label="Total" value={formatMoney(order.total)} />
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
            <h2>Status Information</h2>
            <p>{customerStatusMessage(order.status)}</p>
          </section>
        </>
      ) : null}
    </div>
  )
}
