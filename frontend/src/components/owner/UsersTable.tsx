import { Link } from 'react-router-dom'
import type { UserResponse } from '../../types/user'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

function displayName(user: UserResponse): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}

export function UsersTable({
  users,
  emptyLabel,
  viewPathPrefix,
}: {
  users: UserResponse[]
  emptyLabel: string
  viewPathPrefix?: string
}) {
  if (users.length === 0) {
    return <p className="users-empty">{emptyLabel}</p>
  }

  return (
    <div className="users-table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Created at</th>
            {viewPathPrefix ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{displayName(user)}</td>
              <td>{user.email}</td>
              <td>{user.phone ?? '—'}</td>
              <td>{user.city ?? '—'}</td>
              <td>{formatDate(user.createdAt)}</td>
              {viewPathPrefix ? (
                <td>
                  <Link to={`${viewPathPrefix}/${user.id}`} className="table-action-link">
                    View
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

