import pool from '@/lib/db'
import { CupSize } from '@/types'

// The `cup_sizes` catalog table predates this app's CupSize values, so names
// don't line up 1:1 (e.g. 'double' -> 'Espresso'). Keep the mapping explicit.
export const CUP_SIZE_NAME_BY_VALUE: Record<CupSize, string> = {
  double: 'Espresso',
  quad: 'Quad',
  '6oz': '6 oz',
  '8oz': '8 oz',
  '10oz': '10 oz',
  '12oz': '12 oz',
  '14oz': '14 oz',
  '16oz': '16 oz',
  '18oz': '18 oz',
}

// Labels the alcohol picker in the UI uses that don't exactly match the
// `alcohol_types` catalog names.
const ALCOHOL_NAME_ALIASES: Record<string, string> = {
  'Baileys / Irish Cream': 'Irish Cream',
}

let cupSizeIdCache: Map<string, number> | null = null
export async function getCupSizeId(size: CupSize): Promise<number> {
  if (!cupSizeIdCache) {
    const { rows } = await pool.query('SELECT id, name FROM cup_sizes')
    cupSizeIdCache = new Map(rows.map((r) => [r.name, r.id]))
  }
  const name = CUP_SIZE_NAME_BY_VALUE[size]
  const id = cupSizeIdCache.get(name)
  if (!id) throw new Error(`Unknown cup size: ${size}`)
  return id
}

let alcoholTypesCache: Map<string, number> | null = null
export async function resolveAlcoholTypes(
  names: string[]
): Promise<{ alcoholTypeIds: number[]; otherAlcohol: string | null }> {
  if (!alcoholTypesCache) {
    const { rows } = await pool.query('SELECT id, name FROM alcohol_types')
    alcoholTypesCache = new Map(rows.map((r) => [r.name.toLowerCase(), r.id]))
  }

  const alcoholTypeIds: number[] = []
  const unmatched: string[] = []

  for (const rawName of names) {
    const aliased = ALCOHOL_NAME_ALIASES[rawName] || rawName
    const id = alcoholTypesCache.get(aliased.toLowerCase())
    if (id) {
      alcoholTypeIds.push(id)
    } else {
      unmatched.push(rawName)
    }
  }

  return {
    alcoholTypeIds,
    otherAlcohol: unmatched.length > 0 ? unmatched.join(', ') : null,
  }
}

let flavorsCache: Map<string, number> | null = null
export async function resolveFlavors(
  names: string[]
): Promise<{ flavorIds: number[]; otherFlavor: string | null }> {
  if (!flavorsCache) {
    const { rows } = await pool.query('SELECT id, name FROM flavors')
    flavorsCache = new Map(rows.map((r) => [r.name.toLowerCase(), r.id]))
  }

  const flavorIds: number[] = []
  const unmatched: string[] = []

  for (const rawName of names) {
    const id = flavorsCache.get(rawName.toLowerCase())
    if (id) {
      flavorIds.push(id)
    } else {
      unmatched.push(rawName)
    }
  }

  return {
    flavorIds,
    otherFlavor: unmatched.length > 0 ? unmatched.join(', ') : null,
  }
}

// pg parses DATE columns as a local-midnight JS Date, so build the ISO date
// string from local getters instead of toISOString() to avoid a day shift.
export function dateToISODate(d: Date | null): string | null {
  if (!d) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function toBag(row: any) {
  return {
    id: String(row.id),
    name: row.coffee_name,
    roaster: row.roaster || '',
    city: row.location_name,
    country: '',
    purchaseDate: dateToISODate(row.purchase_date),
    weight: row.weight_grams,
    price: Number(row.price),
    gift: row.is_gift,
    notes: row.notes || '',
    openedDate: dateToISODate(row.opened_date),
    finishedDate: dateToISODate(row.closed_date),
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.created_at.toISOString(),
  }
}

export async function getOrCreatePurchaseLocationId(name: string): Promise<number> {
  const existing = await pool.query(
    'SELECT id FROM purchase_locations WHERE lower(name) = lower($1)',
    [name]
  )
  if (existing.rows.length > 0) return existing.rows[0].id

  const inserted = await pool.query(
    'INSERT INTO purchase_locations (name) VALUES ($1) RETURNING id',
    [name]
  )
  return inserted.rows[0].id
}
