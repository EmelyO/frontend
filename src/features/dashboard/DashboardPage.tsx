import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/authContext'

export function DashboardPage() {
  const { user, isAdmin } = useAuth()

  return (
    <section className="page">
      <p className="muted">
        Sesión iniciada como <strong>{user?.username}</strong> ({user?.role}).
      </p>

      <div className="grid-cards">
        <Link to="/employees" className="card card-link">
          <h2>Empleados</h2>
          <p className="muted">Alta, edición y filtros por nombre, departamento y tipo.</p>
        </Link>
        <Link to="/report" className="card card-link">
          <h2>Reporte semanal</h2>
          <p className="muted">Pago de cada empleado en una semana, con el total de nómina.</p>
        </Link>
        <Link to="/departments" className="card card-link">
          <h2>Departamentos</h2>
          <p className="muted">
            {isAdmin ? 'Administra los departamentos.' : 'Consulta los departamentos.'}
          </p>
        </Link>
        {isAdmin && (
          <Link to="/users" className="card card-link">
            <h2>Usuarios</h2>
            <p className="muted">Alta y consulta de usuarios del sistema con su rol.</p>
          </Link>
        )}
      </div>
    </section>
  )
}
