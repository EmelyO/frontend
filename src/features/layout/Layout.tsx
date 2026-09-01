import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/authContext'
import logo from '@/assets/SUPERINTENDENCIA_DE_BANCOS.png'

function pageTitle(pathname: string): string {
  if (pathname === '/') return 'Inicio'
  if (pathname === '/employees') return 'Empleados'
  if (pathname === '/employees/new') return 'Nuevo empleado'
  if (/^\/employees\/\d+\/edit$/.test(pathname)) return 'Editar empleado'
  if (/^\/employees\/\d+$/.test(pathname)) return 'Ficha del empleado'
  if (pathname === '/report') return 'Reporte semanal'
  if (pathname === '/departments') return 'Departamentos'
  if (pathname === '/users') return 'Usuarios'
  return 'SB · Payroll'
}

function HomeIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3.2 3 10.5V21h6v-6h6v6h6V10.5L12 3.2Z" />
    </svg>
  )
}

export function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const title = pageTitle(pathname)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Superintendencia de Bancos" />
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            <HomeIcon />
            Inicio
          </NavLink>
          <NavLink to="/employees">Empleados</NavLink>
          <NavLink to="/report">Reporte semanal</NavLink>
          <NavLink to="/departments">Departamentos</NavLink>
          {isAdmin && <NavLink to="/users">Usuarios</NavLink>}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-user">
            <strong>{user?.username}</strong>
            <span>{user?.role}</span>
          </span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="main-header">
          <h1>{title}</h1>
        </header>
        <div className="main-body">
          <div className="panel">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
