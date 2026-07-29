import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getOrCreatePurchaseLocationId, toBag } from '@/lib/coffee-mappings'

// The annual "Molido <year>" bag is bookkeeping only, not real inventory.
// It's created already CLOSED, spanning Jan 1 - Dec 31 of its year, so it
// never shows up as an openable/finishable bag in the Bags tab and can't be
// manually opened or closed by the user. A new one is created automatically
// the first time ground coffee is logged in a new year.
export async function POST() {
  try {
    const year = new Date().getFullYear()
    const bagName = `Molido ${year}`

    const existing = await pool.query(
      `SELECT cb.*, pl.name as location_name
       FROM coffee_bags cb
       JOIN purchase_locations pl ON pl.id = cb.purchase_location_id
       WHERE cb.coffee_name = $1 AND pl.name = 'Anual'`,
      [bagName]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json({ success: true, data: toBag(existing.rows[0]) })
    }

    const locationId = await getOrCreatePurchaseLocationId('Anual')
    const jan1 = `${year}-01-01`
    const dec31 = `${year}-12-31`

    const { rows } = await pool.query(
      `INSERT INTO coffee_bags
         (coffee_name, roaster, purchase_date, weight_grams, price, is_gift, purchase_location_id, notes, opened_date, closed_date, status)
       VALUES ($1, '', $2, 0, 0, false, $3, $4, $5, $6, 'CLOSED')
       RETURNING *`,
      [
        bagName,
        jan1,
        locationId,
        'Annual virtual bag for ground coffee tracking',
        jan1,
        dec31,
      ]
    )

    return NextResponse.json({
      success: true,
      data: toBag({ ...rows[0], location_name: 'Anual' }),
    })
  } catch (error) {
    console.error('[ground-coffee:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get or create annual ground coffee bag' },
      { status: 500 }
    )
  }
}
