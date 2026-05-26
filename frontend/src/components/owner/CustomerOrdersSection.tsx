import { Link } from 'react-router-dom'
import type { VehicleResponse } from '../../types/vehicle'
import type { WorkOrderResponse, WorkOrderStatus } from '../../types/workOrder'
import { shortId, vehicleLabel } from '../../utils/customerDetail'

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusBadgeClass(status: WorkOrderStatus): string {
  return `status-badge status-badge-${status.toLowerCase().replace(/_/g, '-')}`
}

function formatStatusLabel(status: WorkOrderStatus): string {
  return status.replace(/_/g, ' ')
}

function orderVehicleLabel(vehicleId: string, vehicleById: Map<string, VehicleResponse>): string {
  const vehicle = vehicleById.get(vehicleId)
  return vehicle ? vehicleLabel(vehicle) : shortId(vehicleId)
}

export function CustomerOrdersSection({
  customerId,
  orders,
  vehicleById,
  loading,
  error,
}: {
  customerId: string
  orders: WorkOrderResponse[]
  vehicleById: Map<string, VehicleResponse>
  loading: boolean
  error: string | null
}) {
  return (
    <section className="detail-card">
      <div className="detail-section-header">
        <h2>Orders</h2>
        <Link
          to={`/owner/work-orders/new?customerId=${customerId}`}
          className="btn-primary"
        >
          Create New Order
        </Link>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p className="users-loading">Loading orders…</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <p className="users-empty">No orders yet.</p>
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{shortId(order.id)}</td>
                  <td>{orderVehicleLabel(order.vehicleId, vehicleById)}</td>
                  <td>
                    <span className={statusBadgeClass(order.status)}>
                      {formatStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>{formatMoney(order.total)}</td>
                  <td>
                    <Link to={`/owner/work-orders/${order.id}`} className="table-action-link">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
