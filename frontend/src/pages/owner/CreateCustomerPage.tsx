import { useNavigate } from 'react-router-dom'
import { CreateUserForm } from '../../components/owner/CreateUserForm'

export function CreateCustomerPage() {
  const navigate = useNavigate()

  return (
    <CreateUserForm
      role="CUSTOMER"
      title="Create customer"
      submitLabel="Create customer"
      backTo="/owner/customers"
      onSuccess={() => navigate('/owner/customers')}
    />
  )
}
