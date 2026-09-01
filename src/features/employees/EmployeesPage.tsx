import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteEmployee, getEmployees, getEmployeeTypes } from '@/features/employees/employeesApi'
import type { EmployeeDto, EmployeeTypeDto } from '@/features/employees/employeeTypes'
import { getDepartments } from '@/features/departments/departmentsApi'
import type { DepartmentDto } from '@/features/departments/departmentsApi'
import { getApiErrorMessage } from '@/shared/api/client'
import { useAuth } from '@/features/auth/authContext'

export function EmployeesPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [employees, setEmployees] = useState<EmployeeDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [types, setTypes] = useState<EmployeeTypeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const [fName, setFName] = useState('')
  const [fDept, setFDept] = useState('')
  const [fType, setFType] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [empRes, deptRes, typeRes] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getEmployeeTypes(),
      ])
      if (!empRes.isSuccess) {
        setError(empRes.message)
        return
      }
      setEmployees(empRes.data ?? [])
      if (deptRes.isSuccess) setDepartments(deptRes.data ?? [])
      if (typeRes.isSuccess) setTypes(typeRes.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const deptName = (id: number | null) =>
    id == null ? '—' : (departments.find((d) => d.id === id)?.name ?? String(id))
  const typeName = (id: number) => types.find((t) => t.id === id)?.name ?? String(id)

  const filtered = useMemo(() => {
    const q = fName.trim().toLowerCase()
    return employees.filter((e) => {
      const matchName =
        !q ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.socialSecurityNumber.toLowerCase().includes(q)
      const matchDept = !fDept || String(e.departmentId ?? '') === fDept
      const matchType = !fType || String(e.employeeTypeId) === fType
      return matchName && matchDept && matchType
    })
  }, [employees, fName, fDept, fType])

  const handleDelete = async (e: EmployeeDto) => {
    if (!window.confirm(`¿Eliminar a ${e.firstName} ${e.lastName}?`)) return
    setBusyId(e.id)
    setActionError(null)
    try {
      const res = await deleteEmployee(e.id)
      if (!res.isSuccess) {
        setActionError(res.message)
        return
      }
      await load()
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="page">
      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="Buscar por nombre o NSS…"
          value={fName}
          onChange={(e) => setFName(e.target.value)}
        />
        <select className="input" value={fDept} onChange={(e) => setFDept(e.target.value)}>
          <option value="">Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select className="input" value={fType} onChange={(e) => setFType(e.target.value)}>
          <option value="">Todos los tipos</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <span className="toolbar-spacer" />
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/employees/new')}
          >
            Nuevo empleado
          </button>
        )}
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>NSS</th>
                <th>Tipo</th>
                <th>Departamento</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    Sin resultados.
                  </td>
                </tr>
              )}
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>
                    <Link to={`/employees/${e.id}`}>
                      {e.firstName} {e.lastName}
                    </Link>
                  </td>
                  <td>{e.socialSecurityNumber}</td>
                  <td>{typeName(e.employeeTypeId)}</td>
                  <td>{deptName(e.departmentId)}</td>
                  <td className="row-actions">
                    <Link to={`/employees/${e.id}`}>Ver</Link>
                    {isAdmin && (
                      <>
                        <Link to={`/employees/${e.id}/edit`}>Editar</Link>
                        <button
                          type="button"
                          className="link-danger"
                          disabled={busyId === e.id}
                          onClick={() => handleDelete(e)}
                        >
                          {busyId === e.id ? '…' : 'Eliminar'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
