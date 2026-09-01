import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/authContext'
import { getApiErrorMessage } from '@/shared/api/client'
import logo from '@/assets/SUPERINTENDENCIA_DE_BANCOS.png'

interface LocationState {
  from?: string
}

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as LocationState | null)?.from ?? '/'

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Usuario o contraseña incorrectos'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="screen-center">
      <form className="card login-card" onSubmit={handleSubmit}>
        <img className="login-logo" src={logo} alt="Superintendencia de Bancos" />
        <h1>Iniciar sesión</h1>
        <p className="muted">Payroll Management</p>

        <label className="field">
          <span>Usuario</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
