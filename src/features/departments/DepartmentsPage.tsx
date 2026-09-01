import { useEffect, useState } from 'react'
import { createDepartment, getDepartments } from '@/features/departments/departmentsApi'
import type { DepartmentDto } from '@/features/departments/departmentsApi'
import { getApiErrorMessage } from '@/shared/api/client'
import { useAuth } from '@/features/auth/authContext'

export function DepartmentsPage() {
  const { isAdmin } = useAuth()
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getDepartments()
      if (!res.isSuccess) {
        setError(res.message)
        return
      }
      setDepartments(res.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const res = await createDepartment({ name: name.trim() })
      if (!res.isSuccess) {
        setFormError(res.message)
        return
      }
      setName('')
      await load()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page">
      {isAdmin && (
        <form className="card inline-form" onSubmit={handleCreate}>
          <label className="field">
            <span>Nuevo departamento</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Agregar'}
          </button>
          {formError && <div className="alert alert-error">{formError}</div>}
        </form>
      )}

      {loading && <p className="muted">Cargando…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 && (
                <tr>
                  <td colSpan={2} className="muted">
                    Sin departamentos.
                  </td>
                </tr>
              )}
              {departments.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
