import { useNavigate } from 'react-router-dom'
import { CreateUserForm } from '../../components/owner/CreateUserForm'

export function CreateMechanicPage() {
  const navigate = useNavigate()

  return (
    <CreateUserForm
      role="MECHANIC"
      title="Create mechanic"
      submitLabel="Create mechanic"
      backTo="/owner/mechanics"
      onSuccess={() => navigate('/owner/mechanics')}
    />
  )
}
