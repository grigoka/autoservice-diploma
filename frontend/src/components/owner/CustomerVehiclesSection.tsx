import { Link } from 'react-router-dom'
import type { VehicleResponse } from '../../types/vehicle'
import { formatDateOnly, formatOptional, vehicleLabel } from '../../utils/customerDetail'

export function CustomerVehiclesSection({
  customerId,
  vehicles,
  loading,
  error,
}: {
  customerId: string
  vehicles: VehicleResponse[]
  loading: boolean
  error: string | null
}) {
  return (
    <section className="detail-card">
      <div className="detail-section-header">
        <h2>Vehicles</h2>
        <Link to={`/owner/customers/${customerId}/vehicles/new`} className="btn-primary">
          Add New Vehicle
        </Link>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p className="users-loading">Loading vehicles…</p> : null}

      {!loading && !error && vehicles.length === 0 ? (
        <p className="users-empty">No vehicles yet.</p>
      ) : null}

      {!loading && !error && vehicles.length > 0 ? (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Brand/Model</th>
                <th>VIN</th>
                <th>Plate</th>
                <th>Next Inspection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicleLabel(vehicle)}</td>
                  <td>{formatOptional(vehicle.vin)}</td>
                  <td>{formatOptional(vehicle.licensePlate)}</td>
                  <td>{formatDateOnly(vehicle.nextInspectionAt)}</td>
                  <td>
                    <Link to={`/owner/vehicles/${vehicle.id}`} className="table-action-link">
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
