import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CustomerOrdersSection } from '../../components/owner/CustomerOrdersSection'
import { CustomerProfileCard } from '../../components/owner/CustomerProfileCard'
import { CustomerVehiclesSection } from '../../components/owner/CustomerVehiclesSection'
import { formatApiError, getCustomerById, updateCustomer } from '../../api/usersApi'
import { getCustomerVehicles } from '../../api/vehiclesApi'
import { getCustomerWorkOrders } from '../../api/workOrdersApi'
import type { UserResponse } from '../../types/user'
import type { VehicleResponse } from '../../types/vehicle'
import type { WorkOrderResponse } from '../../types/workOrder'
import { buildUpdatePayload, toEditForm, type CustomerEditForm } from '../../utils/customerDetail'

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()

  const [customer, setCustomer] = useState<UserResponse | null>(null)
  const [customerLoading, setCustomerLoading] = useState(true)
  const [customerError, setCustomerError] = useState<string | null>(null)

  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [vehiclesError, setVehiclesError] = useState<string | null>(null)

  const [orders, setOrders] = useState<WorkOrderResponse[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<CustomerEditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  const loadCustomer = useCallback(async () => {
    if (!customerId) return
    setCustomerLoading(true)
    setCustomerError(null)
    try {
      setCustomer(await getCustomerById(customerId))
    } catch (err) {
      setCustomerError(formatApiError(err))
    } finally {
      setCustomerLoading(false)
    }
  }, [customerId])

  const loadVehicles = useCallback(async () => {
    if (!customerId) return
    setVehiclesLoading(true)
    setVehiclesError(null)
    try {
      setVehicles(await getCustomerVehicles(customerId))
    } catch (err) {
      setVehiclesError(formatApiError(err))
    } finally {
      setVehiclesLoading(false)
    }
  }, [customerId])

  const loadOrders = useCallback(async () => {
    if (!customerId) return
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      setOrders(await getCustomerWorkOrders(customerId))
    } catch (err) {
      setOrdersError(formatApiError(err))
    } finally {
      setOrdersLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    void loadCustomer()
    void loadVehicles()
    void loadOrders()
  }, [loadCustomer, loadVehicles, loadOrders])

  const vehicleById = useMemo(() => {
    const map = new Map<string, VehicleResponse>()
    for (const vehicle of vehicles) {
      map.set(vehicle.id, vehicle)
    }
    return map
  }, [vehicles])

  function startEdit() {
    if (!customer) return
    setForm(toEditForm(customer))
    setProfileError(null)
    setProfileSuccess(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
    setProfileError(null)
  }

  function updateField<K extends keyof CustomerEditForm>(key: K, value: CustomerEditForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    if (!customerId || !form) return

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setProfileError('First name, last name, and email are required.')
      return
    }

    setSaving(true)
    setProfileError(null)
    setProfileSuccess(null)
    try {
      const updated = await updateCustomer(customerId, buildUpdatePayload(form))
      setCustomer(updated)
      setEditing(false)
      setForm(null)
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  if (!customerId) {
    return <p className="form-error">Customer ID is missing.</p>
  }

  const editForm = form ?? (customer ? toEditForm(customer) : null)

  return (
    <div className="customer-detail-page">
      <p className="users-form-back">
        <Link to="/owner/customers">← Back to customers</Link>
      </p>
      <h1>Customer Details</h1>

      {customerLoading ? <p className="users-loading">Loading customer…</p> : null}
      {customerError ? (
        <div className="users-section-error">
          <p className="form-error">{customerError}</p>
          <button type="button" className="btn-secondary" onClick={() => void loadCustomer()}>
            Retry
          </button>
        </div>
      ) : null}

      {!customerLoading && !customerError && customer && editForm ? (
        <>
          <CustomerProfileCard
            customer={customer}
            editing={editing}
            form={editForm}
            saving={saving}
            profileError={profileError}
            profileSuccess={profileSuccess}
            onEdit={startEdit}
            onCancel={cancelEdit}
            onSubmit={handleProfileSubmit}
            onFieldChange={updateField}
          />
          <CustomerVehiclesSection
            customerId={customerId}
            vehicles={vehicles}
            loading={vehiclesLoading}
            error={vehiclesError}
          />
          <CustomerOrdersSection
            customerId={customerId}
            orders={orders}
            vehicleById={vehicleById}
            loading={ordersLoading}
            error={ordersError}
          />
        </>
      ) : null}
    </div>
  )
}
