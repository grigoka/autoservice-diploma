import { AccountListPage } from '../../components/owner/AccountListPage'
import { getCustomers } from '../../api/usersApi'

export function CustomersPage() {
  return (
    <AccountListPage
      title="Customers"
      description="Manage customer accounts for your auto service."
      loadAccounts={getCustomers}
      createPath="/owner/customers/new"
      createLabel="Create customer"
      emptyLabel="No customers yet."
      viewPathPrefix="/owner/customers"
    />
  )
}
