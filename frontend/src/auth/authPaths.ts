import type { UserRole } from '../types/user'

export function homePathForRole(role: UserRole): string {
  switch (role) {
    case 'OWNER':
      return '/owner/dashboard'
    case 'MECHANIC':
      return '/mechanic/orders'
    case 'CUSTOMER':
      return '/customer/portal'
    default:
      return '/login'
  }
}
