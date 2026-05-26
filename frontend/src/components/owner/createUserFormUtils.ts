import type { CreatableUserRole, CreateUserRequest } from '../../types/user'

export interface UserFormState {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  zip: string
}

export const emptyUserForm = (): UserFormState => ({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  zip: '',
})

export function buildCreatePayload(
  role: CreatableUserRole,
  form: UserFormState,
): CreateUserRequest {
  const payload: CreateUserRequest = {
    role,
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
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

export function validateUserForm(form: UserFormState): string | null {
  if (!form.email.trim()) return 'Email is required.'
  if (!form.password) return 'Password is required.'
  if (form.password.length < 6) return 'Password must be at least 6 characters.'
  if (!form.firstName.trim()) return 'First name is required.'
  if (!form.lastName.trim()) return 'Last name is required.'
  return null
}
