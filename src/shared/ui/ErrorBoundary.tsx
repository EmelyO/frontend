import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { logger } from '@/shared/lib/logger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Excepción no controlada en la UI', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="screen-center">
          <div className="card">
            <h1>Algo salió mal</h1>
            <p className="muted">La pantalla tuvo un error inesperado. Se registró el detalle.</p>
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Recargar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
