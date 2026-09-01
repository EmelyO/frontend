export type Errors = Record<string, string>

export function requiredText(value: string, label: string): string | null {
  return value.trim().length === 0 ? `${label} es obligatorio.` : null
}

export function minLength(value: string, min: number, label: string): string | null {
  return value.trim().length < min ? `${label} debe tener al menos ${min} caracteres.` : null
}

export function socialSecurity(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 5 || digits.length > 15) {
    return 'El N.º de Seguro Social debe tener entre 5 y 15 dígitos.'
  }
  return null
}

export function positiveNumber(value: string, label: string): string | null {
  const n = Number(value)
  if (value.trim() === '' || Number.isNaN(n)) return `${label} debe ser un número.`
  if (n <= 0) return `${label} debe ser mayor que 0.`
  return null
}

export function nonNegativeNumber(value: string, label: string): string | null {
  const n = Number(value)
  if (value.trim() === '' || Number.isNaN(n)) return `${label} debe ser un número.`
  if (n < 0) return `${label} no puede ser negativo.`
  return null
}

export function rate01(value: string, label: string): string | null {
  const n = Number(value)
  if (value.trim() === '' || Number.isNaN(n)) return `${label} debe ser un número.`
  if (n <= 0 || n > 1) return `${label} debe estar entre 0 y 1 (ej. 0.05 = 5%).`
  return null
}

export function dateRange(start: string, end: string): string | null {
  if (!start || !end) return 'Indica ambas fechas.'
  if (end < start) return 'La fecha de fin no puede ser anterior a la de inicio.'
  return null
}

export function firstError(...checks: (string | null)[]): string | null {
  for (const c of checks) if (c) return c
  return null
}
