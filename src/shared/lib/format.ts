const money = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' })

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return '—'
  return money.format(value)
}
