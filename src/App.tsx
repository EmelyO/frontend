import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/features/layout/Layout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { EmployeesPage } from '@/features/employees/EmployeesPage'
import { EmployeeFormPage } from '@/features/employees/EmployeeFormPage'
import { EmployeeDetailPage } from '@/features/employees/EmployeeDetailPage'
import { WeeklyReportPage } from '@/features/payroll/WeeklyReportPage'
import { DepartmentsPage } from '@/features/departments/DepartmentsPage'
import { UsersPage } from '@/features/users/UsersPage'
import { NotFoundPage } from '@/features/common/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        <Route path="/employees" element={<EmployeesPage />} />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute requireAdmin>
              <EmployeeFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route
          path="/employees/:id/edit"
          element={
            <ProtectedRoute requireAdmin>
              <EmployeeFormPage />
            </ProtectedRoute>
          }
        />

        <Route path="/report" element={<WeeklyReportPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute requireAdmin>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
