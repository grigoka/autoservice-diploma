import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { formatApiError, getCustomers } from '../../api/usersApi'
import { getCustomerVehicles } from '../../api/vehiclesApi'
import { createWorkOrder } from '../../api/workOrdersApi'
import type { UserResponse } from '../../types/user'
import type { VehicleResponse } from '../../types/vehicle'
import { customerOptionLabel, vehicleOptionLabel } from '../../utils/workOrderDisplay'

export function CreateWorkOrderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCustomerId = searchParams.get('customerId') ?? ''

  const [customers, setCustomers] = useState<UserResponse[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [customersError, setCustomersError] = useState<string | null>(null)

  const [customerId, setCustomerId] = useState(preselectedCustomerId)
  const [vehicleId, setVehicleId] = useState('')
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [vehiclesError, setVehiclesError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCustomersLoading(true)
    setCustomersError(null)
    getCustomers()
      .then(setCustomers)
      .catch((err) => setCustomersError(formatApiError(err)))
      .finally(() => setCustomersLoading(false))
  }, [])

  const loadVehicles = useCallback(async (selectedCustomerId: string) => {
    if (!selectedCustomerId) {
      setVehicles([])
      setVehicleId('')
      return
    }

    setVehiclesLoading(true)
    setVehiclesError(null)
    try {
      const data = await getCustomerVehicles(selectedCustomerId)
      setVehicles(data)
      setVehicleId((current) =>
        data.some((vehicle) => vehicle.id === current) ? current : (data[0]?.id ?? ''),
      )
    } catch (err) {
      setVehicles([])
      setVehicleId('')
      setVehiclesError(formatApiError(err))
    } finally {
      setVehiclesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadVehicles(customerId)
  }, [customerId, loadVehicles])

  function handleCustomerChange(nextCustomerId: string) {
    setCustomerId(nextCustomerId)
    setVehicleId('')
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!customerId) {
      setError('Please select a customer.')
      return
    }
    if (!vehicleId) {
      setError('Please select a vehicle.')
      return
    }

    setSubmitting(true)
    try {
      await createWorkOrder({ customerId, vehicleId })
      navigate('/owner/work-orders', {
        state: { message: 'Order created successfully.' },
      })
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-form-page">
      <p className="users-form-back">
        <Link to="/owner/work-orders">← Back to orders</Link>
      </p>

      <div className="create-form-card">
        <h1>Create order</h1>
        <p className="create-form-lead">Select a customer and one of their vehicles.</p>

        {customersError ? <p className="form-error">{customersError}</p> : null}

        <form onSubmit={handleSubmit} className="users-form">
          <label className="field users-form-field-wide">
            <span>Customer *</span>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              required
              disabled={customersLoading || submitting}
            >
              <option value="">Select customer…</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customerOptionLabel(customer)}
                </option>
              ))}
            </select>
          </label>

          <label className="field users-form-field-wide">
            <span>Vehicle *</span>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              disabled={!customerId || vehiclesLoading || submitting || vehicles.length === 0}
            >
              <option value="">
                {vehiclesLoading
                  ? 'Loading vehicles…'
                  : !customerId
                    ? 'Select a customer first'
                    : vehicles.length === 0
                      ? 'No vehicles for this customer'
                      : 'Select vehicle…'}
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicleOptionLabel(vehicle)}
                </option>
              ))}
            </select>
          </label>

          {vehiclesError ? <p className="form-error">{vehiclesError}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="users-form-actions">
            <button type="submit" className="btn-primary" disabled={submitting || customersLoading}>
              {submitting ? 'Creating…' : 'Create order'}
            </button>
            <Link to="/owner/work-orders" className="btn-secondary users-form-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
