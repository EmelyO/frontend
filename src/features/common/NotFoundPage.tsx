import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="screen-center">
      <div className="card">
        <h1>404</h1>
        <p className="muted">La página que buscas no existe.</p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
