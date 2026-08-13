// pg parses DATE columns as a local-midnight JS Date, so build the ISO date
// string from local getters instead of toISOString() to avoid a day shift.
export function dateToISODate(d: Date | null): string | null {
  if (!d) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function toCylinder(row: any) {
  return {
    id: String(row.id),
    label: row.label,
    price: Number(row.price),
    purchaseDate: dateToISODate(row.purchase_date),
    notes: row.notes || '',
    openedDate: dateToISODate(row.opened_date),
    finishedDate: dateToISODate(row.closed_date),
    status: row.status,
  }
}

export function toFlavor(row: any) {
  return {
    id: String(row.id),
    name: row.flavor_name,
    brand: row.brand,
    cost: row.cost !== null ? Number(row.cost) : null,
    ml: row.ml,
    remainingMl: row.remaining_ml !== undefined && row.remaining_ml !== null ? Number(row.remaining_ml) : null,
    purchaseDate: dateToISODate(row.purchase_date),
    finishedDate: dateToISODate(row.finished_date),
    alwaysAvailable: row.always_available,
  }
}
