import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { dateToISODate } from '@/lib/coffee-mappings'

// DATE columns have no time component; anchor them to UTC midnight so the
// timestamp doesn't drift a day depending on the server's local timezone.
function dateToUTCTimestamp(d: Date): string {
  return `${dateToISODate(d)}T00:00:00.000Z`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const bagId = searchParams.get('bagId')
    const groundCoffeeOnly = searchParams.get('groundCoffeeOnly') === 'true'
    const coldCoffeeOnly = searchParams.get('coldCoffeeOnly') === 'true'
    const withMilkOnly = searchParams.get('withMilkOnly') === 'true'

    // Cup-specific filters only make sense for 'cup' entries, so when any is
    // active we skip waste/bag events entirely rather than showing them
    // alongside a filtered-down cup list.
    const cupSpecificFilter = groundCoffeeOnly || coldCoffeeOnly || withMilkOnly

    const entries: any[] = []

    {
      const conditions: string[] = []
      const values: any[] = []
      let i = 1

      if (startDate) {
        conditions.push(`cp.prepared_timestamp >= $${i++}`)
        values.push(startDate)
      }
      if (endDate) {
        conditions.push(`cp.prepared_timestamp <= $${i++}`)
        values.push(endDate)
      }
      if (bagId) {
        conditions.push(`cp.bag_id = $${i++}`)
        values.push(bagId)
      }
      if (coldCoffeeOnly) conditions.push('cp.cold_coffee = true')
      if (withMilkOnly) conditions.push('cp.with_milk = true')
      if (groundCoffeeOnly) conditions.push("pl.name = 'Anual'")

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      const { rows } = await pool.query(
        `SELECT cp.*, cs.name as size_name, cb.coffee_name as bag_name, pl.name as location_name
         FROM coffee_preparations cp
         JOIN cup_sizes cs ON cs.id = cp.cup_size_id
         LEFT JOIN coffee_bags cb ON cb.id = cp.bag_id
         LEFT JOIN purchase_locations pl ON pl.id = cb.purchase_location_id
         ${where}
         ORDER BY cp.prepared_timestamp DESC`,
        values
      )

      for (const row of rows) {
        entries.push({
          id: `cup-${row.id}`,
          type: 'cup',
          timestamp: row.prepared_timestamp.toISOString(),
          data: {
            size: row.size_name,
            cups_prepared: row.cups_prepared,
            cold: row.cold_coffee,
            withMilk: row.with_milk,
            contains_alcohol: !!(row.alcohol_type_ids?.length || row.other_alcohol),
            contains_flavor: !!(row.flavor_ids?.length || row.other_flavor),
            bagName: row.bag_name,
          },
        })
      }
    }

    if (!cupSpecificFilter) {
      {
        const conditions: string[] = []
        const values: any[] = []
        let i = 1
        if (startDate) {
          conditions.push(`w.waste_date >= $${i++}`)
          values.push(startDate)
        }
        if (endDate) {
          conditions.push(`w.waste_date <= $${i++}`)
          values.push(endDate)
        }
        if (bagId) {
          conditions.push(`w.bag_id = $${i++}`)
          values.push(bagId)
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
        const { rows } = await pool.query(
          `SELECT w.*, cb.coffee_name as bag_name
           FROM waste w
           JOIN coffee_bags cb ON cb.id = w.bag_id
           ${where}
           ORDER BY w.waste_date DESC`,
          values
        )

        for (const row of rows) {
          entries.push({
            id: `waste-${row.id}`,
            type: 'waste',
            timestamp: dateToUTCTimestamp(row.waste_date),
            data: {
              grams: row.grams_lost,
              reason: row.reason || undefined,
              notes: row.notes || undefined,
              bagName: row.bag_name,
            },
          })
        }
      }

      {
        const conditions: string[] = ["pl.name <> 'Anual'"]
        const values: any[] = []
        let i = 1
        if (bagId) {
          conditions.push(`cb.id = $${i++}`)
          values.push(bagId)
        }
        const where = `WHERE ${conditions.join(' AND ')}`
        const { rows } = await pool.query(
          `SELECT cb.id, cb.coffee_name, cb.opened_date, cb.closed_date
           FROM coffee_bags cb
           JOIN purchase_locations pl ON pl.id = cb.purchase_location_id
           ${where}`,
          values
        )

        for (const row of rows) {
          if (row.opened_date) {
            entries.push({
              id: `bag-opened-${row.id}`,
              type: 'bag_opened',
              timestamp: dateToUTCTimestamp(row.opened_date),
              data: { bagName: row.coffee_name },
            })
          }
          if (row.closed_date) {
            entries.push({
              id: `bag-finished-${row.id}`,
              type: 'bag_finished',
              timestamp: dateToUTCTimestamp(row.closed_date),
              data: { bagName: row.coffee_name },
            })
          }
        }
      }
    }

    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ success: true, data: entries })
  } catch (error) {
    console.error('[history:GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 })
  }
}
