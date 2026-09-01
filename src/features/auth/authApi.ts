import { api } from '@/shared/api/client'
import type { AuthActionResponse, LoginRequest, MeResponse } from '@/features/auth/authTypes'

export async function login(payload: LoginRequest): Promise<AuthActionResponse> {
  const { data } = await api.post<AuthActionResponse>('/Auth/login', payload)
  return data
}

export async function logout(): Promise<void> {
  await api.post('/Auth/logout')
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/Auth/me')
  return data
}
