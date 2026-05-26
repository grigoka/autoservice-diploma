import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TablePagination } from '../../components/owner/TablePagination'
import { formatApiError, getCustomers } from '../../api/usersApi'
import { getVehicles } from '../../api/vehiclesApi'
import { getWorkOrders } from '../../api/workOrdersApi'
import type { UserResponse } from '../../types/user'
import type { VehicleResponse } from '../../types/vehicle'
import type { WorkOrderResponse, WorkOrderStatus } from '../../types/workOrder'
import { WORK_ORDER_STATUSES } from '../../types/workOrder'
import { formatDateTime, shortId } from '../../utils/customerDetail'
import {
  customerLabel,
  formatMoney,
  formatStatusLabel,
  orderMatchesSearch,
  orderVehicleLabel,
  statusBadgeClass,
} from '../../utils/workOrderDisplay'

const PAGE_SIZE = 10

export function WorkOrdersPage() {
  const location = useLocation()
  const successMessage =
    location.state && typeof location.state === 'object' && 'message' in location.state
      ? String((location.state as { message: string }).message)
      : null

  const [orders, setOrders] = useState<WorkOrderResponse[]>([])
  const [customers, setCustomers] = useState<UserResponse[]>([])
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | ''>('')
  const [page, setPage] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = statusFilter ? { status: statusFilter } : undefined
      const [ordersData, customersData, vehiclesData] = await Promise.all([
        getWorkOrders(filters),
        getCustomers(),
        getVehicles(),
      ])
      setOrders(ordersData)
      setCustomers(customersData)
      setVehicles(vehiclesData)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  )

  const vehicleById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  )

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => orderMatchesSearch(order, search, customerById, vehicleById)),
    [orders, search, customerById, vehicleById],
  )

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1))
    }
  }, [page, totalPages])

  const paginatedOrders = useMemo(() => {
    const start = page * PAGE_SIZE
    return filteredOrders.slice(start, start + PAGE_SIZE)
  }, [filteredOrders, page])

  return (
    <div className="users-page">
      <div className="users-section-header">
        <div>
          <h1>Orders</h1>
          <p className="users-lead">Service orders across your workshop.</p>
        </div>
        <Link to="/owner/work-orders/new" className="btn-primary">
          Create order
        </Link>
      </div>

      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      {error ? (
        <div className="users-section-error">
          <p className="form-error">{error}</p>
          <button type="button" className="btn-secondary" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!error ? (
        <div className="list-toolbar">
          <label className="list-toolbar-field list-toolbar-field-grow">
            <span>Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order ID, customer, vehicle, mechanic…"
              disabled={loading}
            />
          </label>
          <label className="list-toolbar-field list-toolbar-field-status">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | '')}
              disabled={loading}
            >
              <option value="">All statuses</option>
              {WORK_ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {loading ? <p className="users-loading">Loading orders…</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <p className="users-empty">No orders yet.</p>
      ) : null}

      {!loading && !error && orders.length > 0 && filteredOrders.length === 0 ? (
        <p className="users-empty">No orders match your search.</p>
      ) : null}

      {!loading && !error && filteredOrders.length > 0 ? (
        <>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Mechanic</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{shortId(order.id)}</td>
                    <td>{customerLabel(order.customerId, customerById)}</td>
                    <td>{orderVehicleLabel(order.vehicleId, vehicleById)}</td>
                    <td>
                      <span className={statusBadgeClass(order.status)}>
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>{order.assignedMechanicName ?? '—'}</td>
                    <td>{formatMoney(order.total)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
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
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  )
}
