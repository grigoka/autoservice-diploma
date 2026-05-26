import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatApiError } from '../../api/usersApi'
import { getAssignedWorkOrders } from '../../api/mechanicWorkOrdersApi'
import type { WorkOrderResponse } from '../../types/workOrder'
import { formatDateTime, shortId } from '../../utils/customerDetail'
import {
  assignedOrderMatchesSearch,
  formatMoney,
  formatStatusLabel,
  statusBadgeClass,
} from '../../utils/workOrderDisplay'

export function MechanicOrdersPage() {
  const [orders, setOrders] = useState<WorkOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await getAssignedWorkOrders())
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredOrders = useMemo(
    () => orders.filter((order) => assignedOrderMatchesSearch(order, search)),
    [orders, search],
  )

  return (
    <div className="users-page">
      <h1>My Orders</h1>
      <p className="users-lead">Work orders assigned to you.</p>

      {error ? (
        <div className="users-section-error">
          <p className="form-error">{error}</p>
          <button type="button" className="btn-secondary" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!error ? (
        <label className="list-search field">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order ID, customer ID, vehicle ID, status…"
            disabled={loading}
          />
        </label>
      ) : null}

      {loading ? <p className="users-loading">Loading orders…</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <p className="users-empty">No assigned orders yet.</p>
      ) : null}

      {!loading && !error && orders.length > 0 && filteredOrders.length === 0 ? (
        <p className="users-empty">No orders match your search.</p>
      ) : null}

      {!loading && !error && filteredOrders.length > 0 ? (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{shortId(order.id)}</td>
                  <td>{shortId(order.customerId)}</td>
                  <td>{shortId(order.vehicleId)}</td>
                  <td>
                    <span className={statusBadgeClass(order.status)}>
                      {formatStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>{formatMoney(order.total)}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <Link to={`/mechanic/orders/${order.id}`} className="table-action-link">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
