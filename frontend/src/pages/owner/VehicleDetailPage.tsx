import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatApiError } from '../../api/usersApi'
import { getVehicleById, updateVehicleInspectionDate } from '../../api/vehiclesApi'
import { getVehicleWorkOrders } from '../../api/workOrdersApi'
import type { VehicleResponse } from '../../types/vehicle'
import type { WorkOrderResponse, WorkOrderStatus } from '../../types/workOrder'
import { formatDateOnly, formatOptional, vehicleLabel } from '../../utils/customerDetail'
import {
  inspectionDateInputToPayload,
  inspectionDateToInputValue,
} from '../../utils/vehicleList'

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusBadgeClass(status: WorkOrderStatus): string {
  return `status-badge status-badge-${status.toLowerCase().replace(/_/g, '-')}`
}

function formatStatusLabel(status: WorkOrderStatus): string {
  return status.replace(/_/g, ' ')
}

function shortId(id: string): string {
  return id.slice(0, 8)
}

export function VehicleDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()

  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [vehicleLoading, setVehicleLoading] = useState(true)
  const [vehicleError, setVehicleError] = useState<string | null>(null)

  const [orders, setOrders] = useState<WorkOrderResponse[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const [inspectionDate, setInspectionDate] = useState('')
  const [inspectionSaving, setInspectionSaving] = useState(false)
  const [inspectionError, setInspectionError] = useState<string | null>(null)
  const [inspectionSuccess, setInspectionSuccess] = useState<string | null>(null)

  const loadVehicle = useCallback(async () => {
    if (!vehicleId) return
    setVehicleLoading(true)
    setVehicleError(null)
    try {
      const data = await getVehicleById(vehicleId)
      setVehicle(data)
      setInspectionDate(inspectionDateToInputValue(data.nextInspectionAt))
    } catch (err) {
      setVehicleError(formatApiError(err))
    } finally {
      setVehicleLoading(false)
    }
  }, [vehicleId])

  const loadOrders = useCallback(async () => {
    if (!vehicleId) return
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      setOrders(await getVehicleWorkOrders(vehicleId))
    } catch (err) {
      setOrdersError(formatApiError(err))
    } finally {
      setOrdersLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    void loadVehicle()
    void loadOrders()
  }, [loadVehicle, loadOrders])

  async function handleInspectionSubmit(e: FormEvent) {
    e.preventDefault()
    if (!vehicleId) return

    setInspectionError(null)
    setInspectionSuccess(null)

    if (!inspectionDate.trim()) {
      setInspectionError('Next inspection date is required.')
      return
    }

    setInspectionSaving(true)
    try {
      const updated = await updateVehicleInspectionDate(vehicleId, {
        nextInspectionAt: inspectionDateInputToPayload(inspectionDate),
      })
      setVehicle(updated)
      setInspectionDate(inspectionDateToInputValue(updated.nextInspectionAt))
      setInspectionSuccess('Inspection date updated.')
    } catch (err) {
      setInspectionError(formatApiError(err))
    } finally {
      setInspectionSaving(false)
    }
  }

  if (!vehicleId) {
    return <p className="form-error">Vehicle ID is missing.</p>
  }

  return (
    <div className="customer-detail-page">
      <p className="users-form-back">
        <Link to="/owner/vehicles">← Back to Vehicles</Link>
      </p>

      {vehicleLoading ? <p className="users-loading">Loading vehicle…</p> : null}
      {vehicleError ? <p className="form-error">{vehicleError}</p> : null}

      {!vehicleLoading && !vehicleError && vehicle ? (
        <>
          <h1>{vehicleLabel(vehicle)}</h1>

          <section className="detail-card">
            <h2>Vehicle information</h2>
            <dl className="detail-dl">
              <div className="detail-dl-row">
                <dt>Brand</dt>
                <dd>{formatOptional(vehicle.make)}</dd>
              </div>
              <div className="detail-dl-row">
                <dt>Model</dt>
                <dd>{formatOptional(vehicle.model)}</dd>
              </div>
              <div className="detail-dl-row">
                <dt>Year</dt>
                <dd>{vehicle.yearOfManufacture ?? '—'}</dd>
              </div>
              <div className="detail-dl-row">
                <dt>VIN</dt>
                <dd>{formatOptional(vehicle.vin)}</dd>
              </div>
              <div className="detail-dl-row">
                <dt>License Plate</dt>
                <dd>{formatOptional(vehicle.licensePlate)}</dd>
              </div>
              <div className="detail-dl-row">
                <dt>Next Inspection</dt>
                <dd>{formatDateOnly(vehicle.nextInspectionAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-card">
            <h2>Update inspection date</h2>
            <form onSubmit={handleInspectionSubmit} className="inspection-form">
              <label className="field">
                <span>Next inspection date</span>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  required
                />
              </label>
              {inspectionError ? <p className="form-error">{inspectionError}</p> : null}
              {inspectionSuccess ? <p className="form-success">{inspectionSuccess}</p> : null}
              <button type="submit" className="btn-primary" disabled={inspectionSaving}>
                {inspectionSaving ? 'Saving…' : 'Update inspection date'}
              </button>
            </form>
          </section>

          <section className="detail-card">
            <h2>Service history</h2>
            {ordersError ? <p className="form-error">{ordersError}</p> : null}
            {ordersLoading ? <p className="users-loading">Loading service history…</p> : null}

            {!ordersLoading && !ordersError && orders.length === 0 ? (
              <p className="users-empty">No work orders yet.</p>
            ) : null}

            {!ordersLoading && !ordersError && orders.length > 0 ? (
              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{shortId(order.id)}</td>
                        <td>
                          <span className={statusBadgeClass(order.status)}>
                            {formatStatusLabel(order.status)}
                          </span>
                        </td>
                        <td>{formatMoney(order.total)}</td>
                        <td>
                          <Link
                            to={`/owner/work-orders/${order.id}`}
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
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  )
}
