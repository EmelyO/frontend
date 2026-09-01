export interface LoginRequest {
  username: string
  password: string
}

export interface AuthActionResponse {
  success: boolean
  message?: string
}

export interface MeResponse {
  userId: string
  username: string
  role: string
}

export interface AuthUser {
  userId: string
  username: string
  role: string
}

export const Roles = {
  Admin: 'Administrador',
} as const

export type RoleName = (typeof Roles)[keyof typeof Roles]
