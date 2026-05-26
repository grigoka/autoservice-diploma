import { AccountListPage } from '../../components/owner/AccountListPage'
import { getMechanics } from '../../api/usersApi'

export function MechanicsPage() {
  return (
    <AccountListPage
      title="Mechanics"
      description="Manage mechanic accounts for your auto service."
      loadAccounts={getMechanics}
      createPath="/owner/mechanics/new"
      createLabel="Create mechanic"
      emptyLabel="No mechanics yet."
    />
  )
}
