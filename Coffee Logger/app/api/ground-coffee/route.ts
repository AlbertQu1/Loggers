import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getOrCreateAnnualGroundCoffeeBagId, toBag } from '@/lib/coffee-mappings'

// The annual "Molido <year>" bag is bookkeeping only, not real inventory.
// It's created already CLOSED, spanning Jan 1 - Dec 31 of its year, so it
// never shows up as an openable/finishable bag in the Bags tab and can't be
// manually opened or closed by the user. A new one is created automatically
// the first time ground coffee is logged in a new year.
export async function POST() {
  try {
    const id = await getOrCreateAnnualGroundCoffeeBagId()
    const { rows } = await pool.query(
      `SELECT cb.*, pl.name as location_name
       FROM coffee_bags cb
       JOIN purchase_locations pl ON pl.id = cb.purchase_location_id
       WHERE cb.id = $1`,
      [id]
    )
    return NextResponse.json({ success: true, data: toBag(rows[0]) })
  } catch (error) {
    console.error('[ground-coffee:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get or create annual ground coffee bag' },
      { status: 500 }
    )
  }
}
