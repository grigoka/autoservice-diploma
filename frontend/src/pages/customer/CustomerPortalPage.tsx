import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCurrentUser } from '../../api/authApi'
import { getMyVehicles, getMyWorkOrders } from '../../api/customerApi'
import { formatApiError } from '../../api/usersApi'
import { useAuth } from '../../auth/useAuth'
import type { UserResponse } from '../../types/user'
import type { VehicleResponse } from '../../types/vehicle'
import type { WorkOrderResponse } from '../../types/workOrder'
import {
  displayName,
  formatAddress,
  formatDateOnly,
  formatDateTime,
  formatOptional,
  shortId,
  vehicleLabel,
} from '../../utils/customerDetail'
import { formatMoney, formatStatusLabel, statusBadgeClass } from '../../utils/workOrderDisplay'

export function CustomerPortalPage() {
  const { user: authUser } = useAuth()

  const [profile, setProfile] = useState<UserResponse | null>(authUser)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [vehiclesError, setVehiclesError] = useState<string | null>(null)

  const [orders, setOrders] = useState<WorkOrderResponse[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    setProfileLoading(true)
    setProfileError(null)
    try {
      setProfile(await fetchCurrentUser())
    } catch (err) {
      setProfileError(formatApiError(err))
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const loadVehicles = useCallback(async () => {
    setVehiclesLoading(true)
    setVehiclesError(null)
    try {
      setVehicles(await getMyVehicles())
    } catch (err) {
      setVehiclesError(formatApiError(err))
    } finally {
      setVehiclesLoading(false)
    }
  }, [])

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      setOrders(await getMyWorkOrders())
    } catch (err) {
      setOrdersError(formatApiError(err))
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
    void loadVehicles()
    void loadOrders()
  }, [loadProfile, loadVehicles, loadOrders])

  const vehicleById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  )

  function orderVehicleLabel(vehicleId: string): string {
    const vehicle = vehicleById.get(vehicleId)
    return vehicle ? vehicleLabel(vehicle) : shortId(vehicleId)
  }


  return (
    <div className="customer-detail-page">
      <h1>Customer Portal</h1>
      <p className="users-lead">Your profile, vehicles, and service orders.</p>

      <section className="detail-card">
        <h2>My Profile</h2>
        {profileLoading ? <p className="users-loading">Loading profile…</p> : null}
        {profileError ? <p className="form-error">{profileError}</p> : null}
        {!profileLoading && !profileError && profile ? (
          <dl className="detail-dl">
            <div className="detail-dl-row">
              <dt>Full name</dt>
              <dd>{displayName(profile)}</dd>
            </div>
            <div className="detail-dl-row">
              <dt>Email</dt>
              <dd>{formatOptional(profile.email)}</dd>
            </div>
            <div className="detail-dl-row">
              <dt>Phone</dt>
              <dd>{formatOptional(profile.phone)}</dd>
            </div>
            <div className="detail-dl-row">
              <dt>Address</dt>
              <dd className="detail-address">{formatAddress(profile)}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="detail-card">
        <h2>My Vehicles</h2>
        {vehiclesError ? <p className="form-error">{vehiclesError}</p> : null}
        {vehiclesLoading ? <p className="users-loading">Loading vehicles…</p> : null}
        {!vehiclesLoading && !vehiclesError && vehicles.length === 0 ? (
          <p className="users-empty">No vehicles yet.</p>
        ) : null}
        {!vehiclesLoading && !vehiclesError && vehicles.length > 0 ? (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Brand/Model</th>
                  <th>VIN</th>
                  <th>License Plate</th>
                  <th>Year</th>
                  <th>Next Inspection</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicleLabel(vehicle)}</td>
                    <td>{formatOptional(vehicle.vin)}</td>
                    <td>{formatOptional(vehicle.licensePlate)}</td>
                    <td>{vehicle.yearOfManufacture ?? '—'}</td>
                    <td>{formatDateOnly(vehicle.nextInspectionAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="detail-card">
        <h2>My Orders</h2>
        {ordersError ? <p className="form-error">{ordersError}</p> : null}
        {ordersLoading ? <p className="users-loading">Loading orders…</p> : null}
        {!ordersLoading && !ordersError && orders.length === 0 ? (
          <p className="users-empty">No service orders yet.</p>
        ) : null}
        {!ordersLoading && !ordersError && orders.length > 0 ? (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{shortId(order.id)}</td>
                    <td>{orderVehicleLabel(order.vehicleId)}</td>
                    <td>
                      <span className={statusBadgeClass(order.status)}>
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>{formatMoney(order.total)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <Link to={`/customer/work-orders/${order.id}`} className="table-action-link">
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
    </div>
  )
}
