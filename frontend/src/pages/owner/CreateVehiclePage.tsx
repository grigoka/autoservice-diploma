import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatApiError, getCustomerById } from '../../api/usersApi'
import { createCustomerVehicle } from '../../api/vehiclesApi'
import {
  buildCreateVehiclePayload,
  emptyVehicleForm,
  validateVehicleForm,
  type VehicleFormState,
} from '../../utils/createVehicleForm'
import { displayName } from '../../utils/customerDetail'

export function CreateVehiclePage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()

  const [form, setForm] = useState<VehicleFormState>(emptyVehicleForm())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState<string | null>(null)

  const backTo = customerId ? `/owner/customers/${customerId}` : '/owner/customers'

  useEffect(() => {
    if (!customerId) return
    getCustomerById(customerId)
      .then((customer) => setCustomerName(displayName(customer)))
      .catch(() => setCustomerName(null))
  }, [customerId])

  function updateField<K extends keyof VehicleFormState>(key: K, value: VehicleFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!customerId) return

    setError(null)
    const validationError = validateVehicleForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      await createCustomerVehicle(customerId, buildCreateVehiclePayload(form))
      navigate(backTo)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!customerId) {
    return <p className="form-error">Customer ID is missing.</p>
  }

  return (
    <div className="create-form-page">
      <p className="users-form-back">
        <Link to={backTo}>← Back to customer</Link>
      </p>

      <div className="create-form-card">
        <h1>Create Vehicle</h1>
        <p className="create-form-lead">Enter the details for a new vehicle.</p>
        {customerName ? (
          <p className="create-form-context">Creating vehicle for: {customerName}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="users-form">
          <div className="users-form-grid">
            <label className="field">
              <span>Brand *</span>
              <input
                type="text"
                value={form.make}
                onChange={(e) => updateField('make', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Model *</span>
              <input
                type="text"
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Year</span>
              <input
                type="number"
                min={1886}
                max={2100}
                step={1}
                value={form.yearOfManufacture}
                onChange={(e) => updateField('yearOfManufacture', e.target.value)}
              />
            </label>
            <label className="field">
              <span>VIN</span>
              <input
                type="text"
                value={form.vin}
                onChange={(e) => updateField('vin', e.target.value)}
              />
            </label>
            <label className="field">
              <span>License Plate</span>
              <input
                type="text"
                value={form.licensePlate}
                onChange={(e) => updateField('licensePlate', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Next Inspection Date</span>
              <input
                type="date"
                value={form.nextInspectionAt}
                onChange={(e) => updateField('nextInspectionAt', e.target.value)}
              />
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="users-form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
            <Link to={backTo} className="btn-secondary users-form-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

