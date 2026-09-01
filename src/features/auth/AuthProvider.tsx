import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '@/features/auth/authContext'
import type { AuthContextValue } from '@/features/auth/authContext'
import type { AuthUser } from '@/features/auth/authTypes'
import { Roles } from '@/features/auth/authTypes'
import { login as loginRequest, logout as logoutRequest, me as meRequest } from '@/features/auth/authApi'
import { setUnauthorizedHandler } from '@/shared/api/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSession = useCallback(async () => {
    try {
      const data = await meRequest()
      setUser({ userId: data.userId, username: data.username, role: data.role })
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    void loadSession()
    return () => setUnauthorizedHandler(null)
  }, [loadSession])

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginRequest({ username, password })
      if (!res.success) {
        throw new Error(res.message ?? 'No se pudo iniciar sesión')
      }
      setLoading(true)
      await loadSession()
    },
    [loadSession],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === Roles.Admin,
    }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
