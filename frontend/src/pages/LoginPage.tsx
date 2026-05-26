import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { homePathForRole } from '../auth/authPaths'
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/auth'

export function LoginPage() {
  const { user, bootstrapping, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const stateFrom = (location.state as { from?: string } | null)?.from
  const redirectTo =
    stateFrom && stateFrom !== '/login' ? stateFrom : null

  if (bootstrapping) {
    return (
      <div className="app-loading">
        <p>Loading…</p>
      </div>
    )
  }

  if (user && localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
    return <Navigate to={redirectTo ?? homePathForRole(user.role)} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="login-lead">
          Accounts are created by your service owner. There is no public registration.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
