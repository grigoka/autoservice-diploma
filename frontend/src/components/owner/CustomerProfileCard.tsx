import type { FormEvent } from 'react'
import type { UserResponse } from '../../types/user'
import {
  displayName,
  formatAddress,
  formatOptional,
  type CustomerEditForm,
} from '../../utils/customerDetail'

export function CustomerProfileCard({
  customer,
  editing,
  form,
  saving,
  profileError,
  profileSuccess,
  onEdit,
  onCancel,
  onSubmit,
  onFieldChange,
}: {
  customer: UserResponse
  editing: boolean
  form: CustomerEditForm
  saving: boolean
  profileError: string | null
  profileSuccess: string | null
  onEdit: () => void
  onCancel: () => void
  onSubmit: (e: FormEvent) => void
  onFieldChange: <K extends keyof CustomerEditForm>(key: K, value: CustomerEditForm[K]) => void
}) {
  return (
    <section className="detail-card">
      <div className="detail-section-header">
        <h2>Customer Information</h2>
        {!editing ? (
          <button type="button" className="btn-secondary" onClick={onEdit}>
            Edit Profile
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="users-form">
          <div className="users-form-grid">
            <label className="field">
              <span>First name *</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => onFieldChange('firstName', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Last name *</span>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => onFieldChange('lastName', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Email *</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => onFieldChange('email', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => onFieldChange('phone', e.target.value)}
              />
            </label>
            <label className="field users-form-field-wide">
              <span>Address line 1</span>
              <input
                type="text"
                value={form.addressLine1}
                onChange={(e) => onFieldChange('addressLine1', e.target.value)}
              />
            </label>
            <label className="field users-form-field-wide">
              <span>Address line 2</span>
              <input
                type="text"
                value={form.addressLine2}
                onChange={(e) => onFieldChange('addressLine2', e.target.value)}
              />
            </label>
            <label className="field">
              <span>City</span>
              <input
                type="text"
                value={form.city}
                onChange={(e) => onFieldChange('city', e.target.value)}
              />
            </label>
            <label className="field">
              <span>ZIP</span>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => onFieldChange('zip', e.target.value)}
              />
            </label>
          </div>
          {profileError ? <p className="form-error">{profileError}</p> : null}
          <div className="users-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="detail-dl">
          <div className="detail-dl-row">
            <dt>Name</dt>
            <dd>{displayName(customer)}</dd>
          </div>
          <div className="detail-dl-row">
            <dt>Email</dt>
            <dd>{formatOptional(customer.email)}</dd>
          </div>
          <div className="detail-dl-row">
            <dt>Phone</dt>
            <dd>{formatOptional(customer.phone)}</dd>
          </div>
          <div className="detail-dl-row">
            <dt>Address</dt>
            <dd className="detail-address">{formatAddress(customer)}</dd>
          </div>
        </dl>
      )}

      {!editing && profileSuccess ? <p className="form-success">{profileSuccess}</p> : null}
    </section>
  )
}

