import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatApiError, getCustomers, getMechanics } from '../../api/usersApi'
import { getVehicles } from '../../api/vehiclesApi'
import { getWorkOrders } from '../../api/workOrdersApi'
import type { UserResponse } from '../../types/user'
import type { VehicleResponse } from '../../types/vehicle'
import type { WorkOrderResponse } from '../../types/workOrder'
import { WORK_ORDER_STATUSES } from '../../types/workOrder'
import { formatDateOnly, formatOptional, shortId, vehicleLabel } from '../../utils/customerDetail'
import {
  countActiveOrders,
  countOrdersByStatus,
  countReadyOrders,
  getCurrentWorkOrders,
  getReadyOrders,
  getUpcomingInspections,
} from '../../utils/dashboard'
import {
  customerLabel,
  formatMoney,
  formatStatusLabel,
  orderVehicleLabel,
  statusBadgeClass,
} from '../../utils/workOrderDisplay'

interface DashboardData {
  customers: UserResponse[]
  mechanics: UserResponse[]
  vehicles: VehicleResponse[]
  workOrders: WorkOrderResponse[]
}

const KPI_CARDS = [
  {
    key: 'customers',
    label: 'Customers',
    helper: 'registered customer accounts',
    count: (d: DashboardData) => d.customers.length,
  },
  {
    key: 'mechanics',
    label: 'Mechanics',
    helper: 'available mechanics',
    count: (d: DashboardData) => d.mechanics.length,
  },
  {
    key: 'vehicles',
    label: 'Vehicles',
    helper: 'vehicles in service records',
    count: (d: DashboardData) => d.vehicles.length,
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    helper: 'all service orders',
    count: (d: DashboardData) => d.workOrders.length,
  },
  {
    key: 'activeOrders',
    label: 'Active Orders',
    helper: 'currently being processed',
    count: (d: DashboardData) => countActiveOrders(d.workOrders),
  },
  {
    key: 'readyOrders',
    label: 'Ready for Pickup',
    helper: 'vehicles ready for customer pickup',
    count: (d: DashboardData) => countReadyOrders(d.workOrders),
  },
] as const

const QUICK_ACTIONS = [
  { label: 'Create customer', to: '/owner/customers/new' },
  { label: 'Create mechanic', to: '/owner/mechanics/new' },
  { label: 'Create order', to: '/owner/work-orders/new' },
  { label: 'Global search', to: '/owner/search' },
  { label: 'Settings', to: '/owner/settings' },
] as const

function OrdersTable({
  orders,
  customerById,
  vehicleById,
  showReadySection,
}: {
  orders: WorkOrderResponse[]
  customerById: Map<string, UserResponse>
  vehicleById: Map<string, VehicleResponse>
  showReadySection?: boolean
}) {
  if (orders.length === 0) {
    return (
      <p className="users-empty">
        {showReadySection ? 'No vehicles ready for pickup.' : 'No active work orders.'}
      </p>
    )
  }

  return (
    <div className="users-table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Vehicle</th>
            {!showReadySection ? <th>Status</th> : null}
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{shortId(order.id)}</td>
              <td>{customerLabel(order.customerId, customerById)}</td>
              <td>{orderVehicleLabel(order.vehicleId, vehicleById)}</td>
              {!showReadySection ? (
                <td>
                  <span className={statusBadgeClass(order.status)}>
                    {formatStatusLabel(order.status)}
                  </span>
                </td>
              ) : null}
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
  )
}

export function OwnerDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    customers: [],
    mechanics: [],
    vehicles: [],
    workOrders: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [customersR, mechanicsR, vehiclesR, ordersR] = await Promise.allSettled([
        getCustomers(),
        getMechanics(),
        getVehicles(),
        getWorkOrders(),
      ])

      const customers = customersR.status === 'fulfilled' ? customersR.value : []
      const mechanics = mechanicsR.status === 'fulfilled' ? mechanicsR.value : []
      const vehicles = vehiclesR.status === 'fulfilled' ? vehiclesR.value : []
      const workOrders = ordersR.status === 'fulfilled' ? ordersR.value : []

      if (
        customersR.status === 'rejected' &&
        mechanicsR.status === 'rejected' &&
        vehiclesR.status === 'rejected' &&
        ordersR.status === 'rejected'
      ) {
        setError(formatApiError(ordersR.reason))
        return
      }

      setData({ customers, mechanics, vehicles, workOrders })
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const customerById = useMemo(
    () => new Map(data.customers.map((customer) => [customer.id, customer])),
    [data.customers],
  )

  const vehicleById = useMemo(
    () => new Map(data.vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [data.vehicles],
  )

  const statusCounts = useMemo(() => countOrdersByStatus(data.workOrders), [data.workOrders])
  const currentWork = useMemo(() => getCurrentWorkOrders(data.workOrders), [data.workOrders])
  const readyOrders = useMemo(() => getReadyOrders(data.workOrders), [data.workOrders])
  const upcomingInspections = useMemo(
    () => getUpcomingInspections(data.vehicles),
    [data.vehicles],
  )

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="users-lead">
          Overview of customers, vehicles and active service orders.
        </p>
      </header>

      {loading ? <p className="users-loading">Loading dashboard…</p> : null}

      {error ? (
        <div className="users-section-error">
          <p className="form-error">{error}</p>
          <button type="button" className="btn-secondary" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="dashboard-kpi-grid" aria-label="Key metrics">
            {KPI_CARDS.map((card) => (
              <article key={card.key} className="dashboard-kpi-card">
                <span className="dashboard-kpi-label">{card.label}</span>
                <span className="dashboard-kpi-value">{card.count(data)}</span>
                <span className="dashboard-kpi-helper">{card.helper}</span>
              </article>
            ))}
          </section>

          <section className="detail-card">
            <h2>Order Status Overview</h2>
            <div className="dashboard-status-grid">
              {WORK_ORDER_STATUSES.map((status) => (
                <article key={status} className="dashboard-status-card">
                  <span className={statusBadgeClass(status)}>{formatStatusLabel(status)}</span>
                  <span className="dashboard-status-count">{statusCounts[status]}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-card">
            <h2>Current Work</h2>
            <OrdersTable
              orders={currentWork}
              customerById={customerById}
              vehicleById={vehicleById}
            />
          </section>

          <section className="detail-card">
            <h2>Ready for Pickup</h2>
            <OrdersTable
              orders={readyOrders}
              customerById={customerById}
              vehicleById={vehicleById}
              showReadySection
            />
          </section>

          <section className="detail-card">
            <h2>Upcoming Inspections</h2>
            {upcomingInspections.length === 0 ? (
              <p className="users-empty">No upcoming inspections.</p>
            ) : (
              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>License Plate</th>
                      <th>Next Inspection</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingInspections.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>{vehicleLabel(vehicle)}</td>
                        <td>{formatOptional(vehicle.licensePlate)}</td>
                        <td>{formatDateOnly(vehicle.nextInspectionAt)}</td>
                        <td>
                          <Link
                            to={`/owner/vehicles/${vehicle.id}`}
                            className="table-action-link"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="detail-card">
            <h2>Quick Actions</h2>
            <div className="dashboard-quick-actions">
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.to} to={action.to} className="btn-secondary">
                  {action.label}
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
