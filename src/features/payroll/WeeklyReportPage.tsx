import { useState } from 'react'
import { getWeeklyReport } from '@/features/payroll/payrollApi'
import type { WeeklyReportItemDto } from '@/features/payroll/payrollTypes'
import { formulaTextForBackendName } from '@/features/employees/employeeTypeRegistry'
import { getApiErrorMessage } from '@/shared/api/client'
import { formatMoney } from '@/shared/lib/format'

export function WeeklyReportPage() {
  const [weekStart, setWeekStart] = useState('')
  const [items, setItems] = useState<WeeklyReportItemDto[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await getWeeklyReport(weekStart)
      if (!res.isSuccess) {
        setError(res.message)
        setItems(null)
        return
      }
      setItems(res.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
      setItems(null)
    } finally {
      setLoading(false)
    }
  }

  const total = (items ?? []).reduce((acc, i) => acc + i.calculatedPay, 0)

  return (
    <section className="page">
      <form className="card inline-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Inicio de semana</span>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading || !weekStart}>
          {loading ? 'Generando…' : 'Generar reporte'}
        </button>
        <small className="muted">
          Usa la misma fecha de inicio con la que se capturaron los registros de esa semana.
        </small>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {items && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Tipo</th>
                <th>Horas</th>
                <th>Ventas</th>
                <th>Cálculo</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No hay registros de nómina para esa semana.
                  </td>
                </tr>
              )}
              {items.map((i) => (
                <tr key={`${i.employeeId}-${i.employeeName}`}>
                  <td>{i.employeeName}</td>
                  <td>{i.employeeType}</td>
                  <td>{i.hoursWorked ?? '—'}</td>
                  <td>{i.grossSales == null ? '—' : formatMoney(i.grossSales)}</td>
                  <td className="muted small">{formulaTextForBackendName(i.employeeType)}</td>
                  <td>{formatMoney(i.calculatedPay)}</td>
                </tr>
              ))}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>
                    Total nómina de la semana
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatMoney(total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </section>
  )
}
