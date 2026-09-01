import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEmployee, getEmployeeTypes, getRate } from '@/features/employees/employeesApi'
import type { EmployeeDto, EmployeeTypeDto } from '@/features/employees/employeeTypes'
import { findTypeByBackendName } from '@/features/employees/employeeTypeRegistry'
import { getDepartments } from '@/features/departments/departmentsApi'
import type { DepartmentDto } from '@/features/departments/departmentsApi'
import {
  createPayrollRecord,
  getEmployeePay,
  getPayrollHistory,
} from '@/features/payroll/payrollApi'
import type { EmployeePayDto, PayrollRecordDto } from '@/features/payroll/payrollTypes'
import { getApiErrorMessage } from '@/shared/api/client'
import { formatMoney } from '@/shared/lib/format'
import { logger } from '@/shared/lib/logger'
import { dateRange, firstError, nonNegativeNumber } from '@/shared/lib/validation'
import { useAuth } from '@/features/auth/authContext'

export function EmployeeDetailPage() {
  const { id } = useParams()
  const employeeId = Number(id)
  const { isAdmin } = useAuth()

  const [employee, setEmployee] = useState<EmployeeDto | null>(null)
  const [types, setTypes] = useState<EmployeeTypeDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [rate, setRate] = useState<Record<string, number>>({})
  const [rateLoaded, setRateLoaded] = useState(false)
  const [pay, setPay] = useState<EmployeePayDto | null>(null)
  const [payMsg, setPayMsg] = useState<string | null>(null)
  const [history, setHistory] = useState<PayrollRecordDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const typeName = useMemo(
    () => types.find((t) => t.id === employee?.employeeTypeId)?.name,
    [types, employee],
  )
  const typeDef = findTypeByBackendName(typeName)
  const weeklyInput = typeDef?.weeklyInput ?? 'none'

  const [wStart, setWStart] = useState('')
  const [wEnd, setWEnd] = useState('')
  const [hours, setHours] = useState('')
  const [sales, setSales] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)

  const loadPayAndHistory = useCallback(async () => {
    const [payRes, histRes] = await Promise.all([
      getEmployeePay(employeeId),
      getPayrollHistory(employeeId),
    ])
    if (payRes.isSuccess && payRes.data) {
      setPay(payRes.data)
      setPayMsg(null)
    } else {
      setPay(null)
      setPayMsg(payRes.message)
    }
    setHistory(histRes.isSuccess ? (histRes.data ?? []) : [])
  }, [employeeId])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true)
      setError(null)
      try {
        const [empRes, typeRes, deptRes] = await Promise.all([
          getEmployee(employeeId),
          getEmployeeTypes(),
          getDepartments(),
        ])
        if (cancelled) return
        if (!empRes.isSuccess || !empRes.data) {
          setError(empRes.message || 'No se encontró el empleado')
          return
        }
        setEmployee(empRes.data)
        const typeList = typeRes.isSuccess ? (typeRes.data ?? []) : []
        setTypes(typeList)
        setDepartments(deptRes.isSuccess ? (deptRes.data ?? []) : [])

        const def = findTypeByBackendName(
          typeList.find((t) => t.id === empRes.data!.employeeTypeId)?.name,
        )
        if (def) {
          const rateRes = await getRate(def, employeeId)
          if (!cancelled && rateRes.isSuccess && rateRes.data) {
            setRate(def.readRate(rateRes.data))
            setRateLoaded(true)
          }
        }
        await loadPayAndHistory()
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
  }, [employeeId, loadPayAndHistory])

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormOk(null)

    const invalid = firstError(
      dateRange(wStart, wEnd),
      weeklyInput === 'hours' ? nonNegativeNumber(hours, 'Las horas trabajadas') : null,
      weeklyInput === 'sales' ? nonNegativeNumber(sales, 'Las ventas brutas') : null,
    )
    if (invalid) {
      setFormError(invalid)
      logger.warn('Validación de captura semanal falló', { employeeId, reason: invalid })
      return
    }

    logger.info('Capturando semana de nómina', { employeeId, wStart, wEnd })
    setSaving(true)
    try {
      const res = await createPayrollRecord({
        employeeId,
        weekStartDate: wStart,
        weekEndDate: wEnd,
        hoursWorked: weeklyInput === 'hours' ? Number(hours) : null,
        grossSales: weeklyInput === 'sales' ? Number(sales) : null,
      })
      if (!res.isSuccess || !res.data) {
        setFormError(res.message)
        return
      }
      setFormOk(`Semana registrada. Pago calculado: ${formatMoney(res.data.calculatedPay)}`)
      setHours('')
      setSales('')
      await loadPayAndHistory()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="muted">Cargando…</p>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!employee) return null

  const deptName =
    employee.departmentId == null
      ? '—'
      : (departments.find((d) => d.id === employee.departmentId)?.name ?? employee.departmentId)

  const rateFields = typeDef?.rateFields ?? []

  return (
    <section className="page">
      <div className="detail-head">
        <div>
          <h2 className="detail-title">
            {employee.firstName} {employee.lastName}
          </h2>
          <p className="muted">
            {typeName ?? 'Tipo desconocido'} · NSS {employee.socialSecurityNumber} · Depto:{' '}
            {deptName}
          </p>
        </div>
        {isAdmin && (
          <Link to={`/employees/${employee.id}/edit`} className="btn btn-secondary">
            Editar
          </Link>
        )}
      </div>

      <div className="cards-row">
        <article className="card">
          <h3>Tarifa capturada</h3>
          {rateFields.length === 0 && <p className="muted">—</p>}
          {rateFields.length > 0 && !rateLoaded ? (
            <p className="muted">
              Aún no capturada.{' '}
              {isAdmin && <Link to={`/employees/${employee.id}/edit`}>Capturar ahora</Link>}
            </p>
          ) : (
            <ul className="kv">
              {rateFields.map((f) => (
                <li key={f.key}>
                  <span>{f.label}</span>
                  <strong>
                    {f.isRate ? (rate[f.key] ?? 0) : formatMoney(rate[f.key] ?? null)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h3>Pago semanal (último)</h3>
          {pay ? (
            <p className="big-number">{formatMoney(pay.weeklyPay)}</p>
          ) : (
            <p className="muted">{payMsg ?? 'Sin registros de nómina todavía.'}</p>
          )}
          <p className="muted small">{typeDef?.formulaText ?? '—'}</p>
        </article>
      </div>

      {isAdmin && (
        <form className="card stack" onSubmit={handleCapture}>
          <h3>Capturar semana / recalcular pago</h3>
          <div className="field-row">
            <label className="field">
              <span>Inicio de semana</span>
              <input
                type="date"
                value={wStart}
                onChange={(e) => setWStart(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Fin de semana</span>
              <input type="date" value={wEnd} onChange={(e) => setWEnd(e.target.value)} required />
            </label>
            {weeklyInput === 'hours' && (
              <label className="field">
                <span>Horas trabajadas</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
              </label>
            )}
            {weeklyInput === 'sales' && (
              <label className="field">
                <span>Ventas brutas</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sales}
                  onChange={(e) => setSales(e.target.value)}
                  required
                />
              </label>
            )}
          </div>
          {formError && <div className="alert alert-error">{formError}</div>}
          {formOk && <div className="alert alert-ok">{formOk}</div>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Calculando…' : 'Registrar semana'}
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Semana</th>
              {weeklyInput === 'hours' && <th>Horas</th>}
              {weeklyInput === 'sales' && <th>Ventas</th>}
              <th>Pago calculado</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={weeklyInput === 'none' ? 2 : 3} className="muted">
                  Sin historial.
                </td>
              </tr>
            )}
            {history.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.weekStartDate} → {r.weekEndDate}
                </td>
                {weeklyInput === 'hours' && <td>{r.hoursWorked ?? '—'}</td>}
                {weeklyInput === 'sales' && (
                  <td>{r.grossSales == null ? '—' : formatMoney(r.grossSales)}</td>
                )}
                <td>{formatMoney(r.calculatedPay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
