import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import type { UserRole } from '../types/user'
import { ownerNavLinks } from './ownerNav'

function roleNavLinks(role: UserRole): { to: string; label: string }[] {
  switch (role) {
    case 'MECHANIC':
      return [{ to: '/mechanic/orders', label: 'My Orders' }]
    case 'CUSTOMER':
      return [{ to: '/customer/portal', label: 'Portal' }]
    default:
      return []
  }
}

function OwnerSidebar() {
  return (
    <aside className="app-sidebar" aria-label="Owner navigation">
      <nav className="app-sidebar-nav">
        {ownerNavLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'app-sidebar-link app-sidebar-link-active' : 'app-sidebar-link'
            }
            end={to === '/owner/dashboard'}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function OwnerTopbar({
  displayName,
  email,
  role,
  onLogout,
}: {
  displayName: string
  email: string
  role: UserRole
  onLogout: () => void
}) {
  return (
    <header className="app-topbar">
      <div className="app-topbar-brand">
        <strong>AutoService CRM</strong>
      </div>
      <label className="app-topbar-search">
        <span className="visually-hidden">Search</span>
        <input type="search" placeholder="Search…" disabled aria-disabled="true" />
      </label>
      <div className="app-topbar-user">
        <span className="app-topbar-user-name" title={email}>
          {displayName}
        </span>
        <span className="app-topbar-role">{role}</span>
        <button type="button" className="btn-secondary" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email

  if (user.role === 'OWNER') {
    return (
      <div className="app-shell app-shell-owner">
        <OwnerSidebar />
        <div className="app-body">
          <OwnerTopbar
            displayName={displayName}
            email={user.email}
            role={user.role}
            onLogout={logout}
          />
          <main className="app-main app-main-owner">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  const links = roleNavLinks(user.role)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <strong>AutoService CRM</strong>
        </div>
        <nav className="app-header-nav" aria-label="Main">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="app-header-user"><span className="app-header-user-name" title={user.email}>{displayName}</span><span className="app-header-role">{user.role}</span><button type="button" className="btn-secondary" onClick={logout}>Log out</button></div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}



