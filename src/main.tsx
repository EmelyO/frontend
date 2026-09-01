import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'
import { logger } from '@/shared/lib/logger'
import './index.css'
import './App.css'
import App from './App.tsx'

window.addEventListener('error', (e) => {
  logger.error('window.onerror', { message: e.message, source: e.filename, line: e.lineno })
})
window.addEventListener('unhandledrejection', (e) => {
  logger.error('Promesa sin catch', { reason: String(e.reason) })
})

logger.info('App iniciada', { env: import.meta.env.MODE })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
