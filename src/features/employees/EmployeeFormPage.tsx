import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createEmployee,
  createRate,
  getEmployee,
  getEmployeeTypes,
  getRate,
  updateEmployee,
  updateRate,
} from '@/features/employees/employeesApi'
import type { EmployeeTypeDto } from '@/features/employees/employeeTypes'
import { findTypeByBackendName } from '@/features/employees/employeeTypeRegistry'
import type { EmployeeTypeDef } from '@/features/employees/employeeTypeRegistry'
import { getDepartments } from '@/features/departments/departmentsApi'
import type { DepartmentDto } from '@/features/departments/departmentsApi'
import { getApiErrorMessage } from '@/shared/api/client'

type RateState = Record<string, string>

function toNumbers(rate: RateState): Record<string, number> {
  const out: Record<string, number> = {}
  for (const k of Object.keys(rate)) out[k] = Number(rate[k] ?? 0)
  return out
}

export function EmployeeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const employeeId = id ? Number(id) : null
  const isNew = employeeId == null

  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [types, setTypes] = useState<EmployeeTypeDto[]>([])

  const [typeId, setTypeId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [ssn, setSsn] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [rate, setRate] = useState<RateState>({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const typeDef = useMemo<EmployeeTypeDef | undefined>(() => {
    const t = types.find((x) => String(x.id) === typeId)
    return findTypeByBackendName(t?.name)
  }, [types, typeId])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true)
      setError(null)
      try {
        const [deptRes, typeRes] = await Promise.all([getDepartments(), getEmployeeTypes()])
        if (cancelled) return
        if (deptRes.isSuccess) setDepartments(deptRes.data ?? [])
        const typeList = typeRes.isSuccess ? (typeRes.data ?? []) : []
        setTypes(typeList)

        if (!isNew && employeeId != null) {
          const empRes = await getEmployee(employeeId)
          if (cancelled) return
          if (!empRes.isSuccess || !empRes.data) {
            setError(empRes.message || 'No se encontró el empleado')
            return
          }
          const emp = empRes.data
          setTypeId(String(emp.employeeTypeId))
          setFirstName(emp.firstName)
          setLastName(emp.lastName)
          setSsn(emp.socialSecurityNumber)
          setDepartmentId(emp.departmentId != null ? String(emp.departmentId) : '')

          const def = findTypeByBackendName(
            typeList.find((t) => t.id === emp.employeeTypeId)?.name,
          )
          if (def) {
            const rateRes = await getRate(def, employeeId)
            if (!cancelled && rateRes.isSuccess && rateRes.data) {
              const values = def.readRate(rateRes.data)
              setRate(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)])))
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [employeeId, isNew])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setWarning(null)

    if (!typeDef) {
      setError('Selecciona un tipo de empleado válido.')
      return
    }

    setSaving(true)
    try {
      const base = {
        employeeTypeId: Number(typeId),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        socialSecurityNumber: ssn.trim(),
        departmentId: departmentId ? Number(departmentId) : null,
      }
      const rateNums = toNumbers(rate)
      let targetId = employeeId ?? 0

      if (isNew) {
        const created = await createEmployee(base)
        if (!created.isSuccess || !created.data) {
          setError(created.message || 'No se pudo crear el empleado')
          return
        }
        targetId = created.data.id
        const rateRes = await createRate(typeDef, targetId, rateNums)
        if (!rateRes.isSuccess) {
          setWarning(
            `El empleado #${targetId} se creó, pero falló al guardar la tarifa: ${rateRes.message}. Edítalo para completarla.`,
          )
          return
        }
      } else {
        const updated = await updateEmployee(targetId, base)
        if (!updated.isSuccess) {
          setError(updated.message || 'No se pudo actualizar el empleado')
          return
        }
        const put = await updateRate(typeDef, targetId, rateNums)
        if (!put.isSuccess) {
          const post = await createRate(typeDef, targetId, rateNums)
          if (!post.isSuccess) {
            setWarning(`Datos base guardados, pero la tarifa falló: ${put.message}`)
            return
          }
        }
      }

      navigate(`/employees/${targetId}`, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="muted">Cargando…</p>

  const rateFields = typeDef?.rateFields ?? []

  return (
    <section className="page form-page">
      <form className="card stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Tipo de empleado</span>
          <select
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value)
              setRate({})
            }}
            disabled={!isNew}
            required
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {!isNew && <small className="muted">El tipo no se puede cambiar.</small>}
        </label>

        <div className="field-row">
          <label className="field">
            <span>Primer nombre</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label className="field">
            <span>Apellido paterno</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>N.º Seguro Social</span>
            <input value={ssn} onChange={(e) => setSsn(e.target.value)} required />
          </label>
          <label className="field">
            <span>Departamento</span>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">— Sin departamento —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {rateFields.length > 0 && (
          <div className="field-row">
            {rateFields.map((f) => (
              <label key={f.key} className="field">
                <span>{f.label}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate[f.key] ?? ''}
                  onChange={(e) => setRate((r) => ({ ...r, [f.key]: e.target.value }))}
                  required
                />
                {f.hint && <small className="muted">{f.hint}</small>}
              </label>
            ))}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {warning && <div className="alert alert-warn">{warning}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isNew ? 'Crear empleado' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  )
}
