import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RoleRoute } from './auth/RoleRoute'
import { AppLayout } from './layouts/AppLayout'
import { CustomerPortalPage } from './pages/customer/CustomerPortalPage'
import { CustomerWorkOrderDetailPage } from './pages/customer/CustomerWorkOrderDetailPage'
import { LoginPage } from './pages/LoginPage'
import { MechanicOrderDetailPage } from './pages/mechanic/MechanicOrderDetailPage'
import { MechanicOrdersPage } from './pages/mechanic/MechanicOrdersPage'
import { CreateCustomerPage } from './pages/owner/CreateCustomerPage'
import { CreateVehiclePage } from './pages/owner/CreateVehiclePage'
import { CreateMechanicPage } from './pages/owner/CreateMechanicPage'
import { CreateWorkOrderPage } from './pages/owner/CreateWorkOrderPage'
import { CustomerDetailPage } from './pages/owner/CustomerDetailPage'
import { CustomersPage } from './pages/owner/CustomersPage'
import { GlobalSearchPage } from './pages/owner/GlobalSearchPage'
import { MechanicsPage } from './pages/owner/MechanicsPage'
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage'
import { SettingsPage } from './pages/owner/SettingsPage'
import { VehicleDetailPage } from './pages/owner/VehicleDetailPage'
import { VehiclesPage } from './pages/owner/VehiclesPage'
import { WorkOrderDetailPage } from './pages/owner/WorkOrderDetailPage'
import { WorkOrdersPage } from './pages/owner/WorkOrdersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute allowedRoles={['OWNER']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/customers" element={<CustomersPage />} />
            <Route path="/owner/customers/new" element={<CreateCustomerPage />} />
            <Route
              path="/owner/customers/:customerId/vehicles/new"
              element={<CreateVehiclePage />}
            />
            <Route path="/owner/customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="/owner/mechanics" element={<MechanicsPage />} />
            <Route path="/owner/mechanics/new" element={<CreateMechanicPage />} />
            <Route path="/owner/vehicles" element={<VehiclesPage />} />
            <Route path="/owner/vehicles/:vehicleId" element={<VehicleDetailPage />} />
            <Route path="/owner/work-orders/new" element={<CreateWorkOrderPage />} />
            <Route path="/owner/work-orders/:orderId" element={<WorkOrderDetailPage />} />
            <Route path="/owner/work-orders" element={<WorkOrdersPage />} />
            <Route path="/owner/search" element={<GlobalSearchPage />} />
            <Route path="/owner/settings" element={<SettingsPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['MECHANIC']} />}>
            <Route path="/mechanic/orders" element={<MechanicOrdersPage />} />
            <Route path="/mechanic/orders/:orderId" element={<MechanicOrderDetailPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/customer/work-orders/:orderId" element={<CustomerWorkOrderDetailPage />} />
            <Route path="/customer/portal" element={<CustomerPortalPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
