import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { OperationResult } from '@/shared/types/operationResult'
import { logger } from '@/shared/lib/logger'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  throw new Error('VITE_API_URL no está definido. Revisa frontend/.env')
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

const AUTH_PROBE_PATHS = ['/Auth/login', '/Auth/me']

type TimedConfig = InternalAxiosRequestConfig & { metadata?: { start: number } }

api.interceptors.request.use((config: TimedConfig) => {
  config.metadata = { start: performance.now() }
  logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

api.interceptors.response.use(
  (response) => {
    const cfg = response.config as TimedConfig
    const ms = cfg.metadata ? Math.round(performance.now() - cfg.metadata.start) : 0
    logger.info(`← ${response.status} ${cfg.method?.toUpperCase()} ${cfg.url} (${ms}ms)`)
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const cfg = error.config as TimedConfig | undefined
    const url = cfg?.url ?? ''
    const ms = cfg?.metadata ? Math.round(performance.now() - cfg.metadata.start) : 0
    const isAuthProbe = AUTH_PROBE_PATHS.some((p) => url.includes(p))

    const line = `✗ ${status ?? 'ERR'} ${cfg?.method?.toUpperCase()} ${url} (${ms}ms)`
    if (status === 401 || status === 403 || status === 404) logger.warn(line, error.message)
    else logger.error(line, error.message)

    if (status === 401 && !isAuthProbe) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

export async function opResult<T>(
  request: Promise<AxiosResponse<OperationResult<T>>>,
): Promise<OperationResult<T>> {
  try {
    const { data } = await request
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const body = err.response.data
      if (body && typeof body === 'object' && 'isSuccess' in body) {
        return body as OperationResult<T>
      }
      if (typeof body === 'string' && body.trim()) {
        return { isSuccess: false, message: body, data: null }
      }
    }
    throw err
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.message) return error.message
  }
  return fallback
}
