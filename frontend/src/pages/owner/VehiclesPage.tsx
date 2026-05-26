import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatApiError } from '../../api/usersApi'
import { getVehicles } from '../../api/vehiclesApi'
import type { VehicleResponse } from '../../types/vehicle'
import { formatDateOnly, formatOptional, vehicleLabel } from '../../utils/customerDetail'
import { vehicleMatchesSearch } from '../../utils/vehicleList'

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setVehicles(await getVehicles())
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicleMatchesSearch(vehicle, search)),
    [vehicles, search],
  )

  return (
    <div className="users-page">
      <h1>Vehicles</h1>
      <p className="users-lead">
        All vehicles in your service. To add a vehicle, open a{' '}
        <Link to="/owner/customers">customer</Link> and use Add New Vehicle.
      </p>

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
            placeholder="Brand, model, VIN, or license plate…"
            disabled={loading}
          />
        </label>
      ) : null}

      {loading ? <p className="users-loading">Loading vehicles…</p> : null}

      {!loading && !error && vehicles.length === 0 ? (
        <p className="users-empty">No vehicles yet.</p>
      ) : null}

      {!loading && !error && vehicles.length > 0 && filteredVehicles.length === 0 ? (
        <p className="users-empty">No vehicles match your search.</p>
      ) : null}

      {!loading && !error && filteredVehicles.length > 0 ? (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Brand/Model</th>
                <th>VIN</th>
                <th>License Plate</th>
                <th>Year</th>
                <th>Next Inspection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicleLabel(vehicle)}</td>
                  <td>{formatOptional(vehicle.vin)}</td>
                  <td>{formatOptional(vehicle.licensePlate)}</td>
                  <td>{vehicle.yearOfManufacture ?? '—'}</td>
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
    </div>
  )
}
