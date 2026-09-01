import { useEffect, useState } from 'react'
import { createUser, getRoles, getUsers } from '@/features/users/usersApi'
import type { RoleDto, UserDto } from '@/features/users/usersApi'
import { getApiErrorMessage } from '@/shared/api/client'

export function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([])
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()])
      if (!usersRes.isSuccess) {
        setError(usersRes.message)
        return
      }
      setUsers(usersRes.data ?? [])
      if (rolesRes.isSuccess) {
        setRoles(rolesRes.data ?? [])
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const roleName = (id: number) => roles.find((r) => r.id === id)?.name ?? id

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormOk(null)
    setSaving(true)
    try {
      const res = await createUser({
        username: username.trim(),
        password,
        roleId: Number(roleId),
      })
      if (!res.isSuccess) {
        setFormError(res.message)
        return
      }
      setFormOk(`Usuario "${res.data?.username ?? username}" creado.`)
      setUsername('')
      setPassword('')
      setRoleId('')
      await load()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page">
      <form className="card inline-form" onSubmit={handleCreate}>
        <label className="field">
          <span>Usuario</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            required
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label className="field">
          <span>Rol</span>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
            <option value="" disabled>
              Seleccionar…
            </option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving || roles.length === 0}>
          {saving ? 'Creando…' : 'Crear usuario'}
        </button>
        {formError && <div className="alert alert-error">{formError}</div>}
        {formOk && <div className="alert alert-ok">{formOk}</div>}
      </form>

      {loading && <p className="muted">Cargando…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    Sin usuarios.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{roleName(u.roleId)}</td>
                  <td>{new Date(u.createdDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
