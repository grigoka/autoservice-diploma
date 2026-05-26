import type { UserResponse } from '../types/user'
import type { VehicleResponse } from '../types/vehicle'

export function displayName(user: Pick<UserResponse, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}

export function formatOptional(value: string | null | undefined): string {
  return value?.trim() ? value.trim() : '—'
}

export function formatAddress(user: Pick<
  UserResponse,
  'addressLine1' | 'addressLine2' | 'city' | 'zip'
>): string {
  const lineParts = [user.addressLine1, user.addressLine2]
    .map((part) => part?.trim())
    .filter(Boolean)
  const cityParts = [user.city, user.zip]
    .map((part) => part?.trim())
    .filter(Boolean)

  const lines: string[] = []
  if (lineParts.length > 0) {
    lines.push(lineParts.join(', '))
  }
  if (cityParts.length > 0) {
    lines.push(cityParts.join(' '))
  }

  return lines.length > 0 ? lines.join('\n') : '—'
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString()
}

export function vehicleLabel(vehicle: VehicleResponse): string {
  const parts = [vehicle.make, vehicle.model]
  if (vehicle.yearOfManufacture != null) {
    parts.push(String(vehicle.yearOfManufacture))
  }
  return parts.filter(Boolean).join(' ')
}

/** Short display id from UUID — uses last segment so seeded ids stay distinguishable. */
export function shortId(id: string): string {
  const lastSegment = id.split('-').pop() ?? id.replace(/-/g, '')
  if (lastSegment.length <= 8) return lastSegment
  return lastSegment.slice(-8)
}

export function toEditForm(user: UserResponse) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? '',
    addressLine1: user.addressLine1 ?? '',
    addressLine2: user.addressLine2 ?? '',
    city: user.city ?? '',
    zip: user.zip ?? '',
  }
}

export type CustomerEditForm = ReturnType<typeof toEditForm>

export function buildUpdatePayload(form: CustomerEditForm): import('../types/user').UpdateUserRequest {
  const payload: import('../types/user').UpdateUserRequest = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
  }

  const phone = form.phone.trim()
  const addressLine1 = form.addressLine1.trim()
  const addressLine2 = form.addressLine2.trim()
  const city = form.city.trim()
  const zip = form.zip.trim()

  if (phone) payload.phone = phone
  if (addressLine1) payload.addressLine1 = addressLine1
  if (addressLine2) payload.addressLine2 = addressLine2
  if (city) payload.city = city
  if (zip) payload.zip = zip

  return payload
}
