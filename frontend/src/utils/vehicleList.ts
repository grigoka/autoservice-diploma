import type { VehicleResponse } from '../types/vehicle'

export function vehicleMatchesSearch(vehicle: VehicleResponse, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    vehicle.make,
    vehicle.model,
    vehicle.vin,
    vehicle.licensePlate,
    vehicle.yearOfManufacture != null ? String(vehicle.yearOfManufacture) : '',
  ]
    .filter((part) => part != null && String(part).trim() !== '')
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function inspectionDateToInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function inspectionDateInputToPayload(date: string): string {
  return `${date}T00:00:00.000Z`
}
