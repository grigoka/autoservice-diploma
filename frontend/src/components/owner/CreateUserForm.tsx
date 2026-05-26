import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createUser, formatApiError } from '../../api/usersApi'
import type { CreatableUserRole } from '../../types/user'
import {
  buildCreatePayload,
  emptyUserForm,
  validateUserForm,
  type UserFormState,
} from './createUserFormUtils'

export function CreateUserForm({
  role,
  title,
  submitLabel,
  backTo,
  onSuccess,
}: {
  role: CreatableUserRole
  title: string
  submitLabel: string
  backTo: string
  onSuccess: () => void
}) {
  const [form, setForm] = useState<UserFormState>(emptyUserForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validateUserForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      await createUser(buildCreatePayload(role, form))
      onSuccess()
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="users-form-page">
      <p className="users-form-back">
        <Link to={backTo}>← Back</Link>
      </p>
      <h1>{title}</h1>
      <form onSubmit={handleSubmit} className="users-form">
        <div className="users-form-grid">
          <label className="field">
            <span>Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password *</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              minLength={6}
              required
            />
          </label>
          <label className="field">
            <span>First name *</span>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Last name *</span>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </label>
          <label className="field">
            <span>City</span>
            <input
              type="text"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </label>
          <label className="field users-form-field-wide">
            <span>Address line 1</span>
            <input
              type="text"
              value={form.addressLine1}
              onChange={(e) => updateField('addressLine1', e.target.value)}
            />
          </label>
          <label className="field users-form-field-wide">
            <span>Address line 2</span>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) => updateField('addressLine2', e.target.value)}
            />
          </label>
          <label className="field">
            <span>ZIP</span>
            <input
              type="text"
              value={form.zip}
              onChange={(e) => updateField('zip', e.target.value)}
            />
          </label>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="users-form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : submitLabel}
          </button>
          <Link to={backTo} className="btn-secondary users-form-cancel">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

