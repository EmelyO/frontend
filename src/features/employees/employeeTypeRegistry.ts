export type WeeklyInput = 'hours' | 'sales' | 'none'

export interface RateFieldDef {
  key: string
  label: string
  hint?: string
  isRate?: boolean
}

export interface EmployeeTypeDef {
  key: string
  backendName: string
  subtypePath: string
  rateFields: RateFieldDef[]
  weeklyInput: WeeklyInput
  formulaText: string
  readRate: (dto: Record<string, unknown>) => Record<string, number>
  toCreateBody: (employeeId: number, rate: Record<string, number>) => Record<string, unknown>
  toUpdateBody: (rate: Record<string, number>) => Record<string, unknown>
}

const num = (v: unknown) => Number(v ?? 0)

export const EMPLOYEE_TYPES: EmployeeTypeDef[] = [
  {
    key: 'salaried',
    backendName: 'Asalariado',
    subtypePath: '/SalariedEmployees',
    rateFields: [{ key: 'weeklySalary', label: 'Salario semanal' }],
    weeklyInput: 'none',
    formulaText: 'Pago = salario semanal',
    readRate: (d) => ({ weeklySalary: num(d.weeklySalary) }),
    toCreateBody: (employeeId, r) => ({ employeeId, weeklySalary: r.weeklySalary }),
    toUpdateBody: (r) => ({ weeklySalary: r.weeklySalary }),
  },
  {
    key: 'hourly',
    backendName: 'Por Horas',
    subtypePath: '/HourlyEmployees',
    rateFields: [{ key: 'hourlyRate', label: 'Sueldo por hora' }],
    weeklyInput: 'hours',
    formulaText:
      'Pago = tarifa × horas si horas ≤ 40; si no, tarifa × 40 + tarifa × 1.5 × (horas − 40)',
    readRate: (d) => ({ hourlyRate: num(d.hourlyRate) }),
    toCreateBody: (employeeId, r) => ({ employeeId, hourlyRate: r.hourlyRate }),
    toUpdateBody: (r) => ({ hourlyRate: r.hourlyRate }),
  },
  {
    key: 'commission',
    backendName: 'Por Comisión',
    subtypePath: '/CommissionEmployees',
    rateFields: [
      { key: 'commissionRate', label: 'Tarifa de comisión', hint: 'ej. 0.05 = 5%', isRate: true },
    ],
    weeklyInput: 'sales',
    formulaText: 'Pago = ventas brutas × tarifa de comisión',
    readRate: (d) => ({ commissionRate: num(d.commissionRate) }),
    toCreateBody: (employeeId, r) => ({ employeeId, commissionRate: r.commissionRate }),
    toUpdateBody: (r) => ({ commissionRate: r.commissionRate }),
  },
  {
    key: 'salariedCommission',
    backendName: 'Asalariado por Comisión',
    subtypePath: '/SalariedCommissionEmployees',
    rateFields: [
      { key: 'commissionRate', label: 'Tarifa de comisión', hint: 'ej. 0.05 = 5%', isRate: true },
      { key: 'baseSalary', label: 'Salario base' },
    ],
    weeklyInput: 'sales',
    formulaText: 'Pago = ventas × tarifa + salario base + 10% del salario base',
    readRate: (d) => ({
      commissionRate: num(d.commissionRate),
      baseSalary: num(d.baseSalary),
    }),
    toCreateBody: (employeeId, r) => ({
      employeeId,
      commissionRate: r.commissionRate,
      baseSalary: r.baseSalary,
    }),
    toUpdateBody: (r) => ({ commissionRate: r.commissionRate, baseSalary: r.baseSalary }),
  },
]

export function findTypeByBackendName(name: string | undefined | null): EmployeeTypeDef | undefined {
  if (!name) return undefined
  return EMPLOYEE_TYPES.find((t) => t.backendName === name)
}

export function findTypeByKey(key: string | undefined | null): EmployeeTypeDef | undefined {
  if (!key) return undefined
  return EMPLOYEE_TYPES.find((t) => t.key === key)
}

export function formulaTextForBackendName(name: string | undefined | null): string {
  return findTypeByBackendName(name)?.formulaText ?? '—'
}
