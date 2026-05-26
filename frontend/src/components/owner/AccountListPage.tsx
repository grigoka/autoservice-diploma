import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatApiError } from '../../api/usersApi'
import type { UserResponse } from '../../types/user'
import { UsersTable } from './UsersTable'

interface AccountListPageProps {
  title: string
  description: string
  loadAccounts: () => Promise<UserResponse[]>
  createPath: string
  createLabel: string
  emptyLabel: string
  viewPathPrefix?: string
}

export function AccountListPage({
  title,
  description,
  loadAccounts,
  createPath,
  createLabel,
  emptyLabel,
  viewPathPrefix,
}: AccountListPageProps) {
  const [accounts, setAccounts] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAccounts(await loadAccounts())
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [loadAccounts])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="users-page">
      <div className="users-section-header">
        <div>
          <h1>{title}</h1>
          <p className="users-lead">{description}</p>
        </div>
        <Link to={createPath} className="btn-primary">
          {createLabel}
        </Link>
      </div>

      {error ? (
        <div className="users-section-error">
          <p className="form-error">{error}</p>
          <button type="button" className="btn-secondary" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="users-loading">Loading…</p>
      ) : !error ? (
        <UsersTable users={accounts} emptyLabel={emptyLabel} viewPathPrefix={viewPathPrefix} />
      ) : null}
    </div>
  )
}
