import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getOrCreatePurchaseLocationId, toBag } from '@/lib/coffee-mappings'

export async function GET() {
  try {
    // Annual "Molido <year>" ground-coffee bags are bookkeeping-only
    // (see app/api/ground-coffee/route.ts) and shouldn't show up as
    // manageable bags in the Bags tab or Waste bag picker.
    const { rows } = await pool.query(`
      SELECT cb.*, pl.name as location_name
      FROM coffee_bags cb
      JOIN purchase_locations pl ON pl.id = cb.purchase_location_id
      WHERE pl.name <> 'Anual'
      ORDER BY cb.created_at DESC
    `)
    return NextResponse.json({ success: true, data: rows.map(toBag) })
  } catch (error) {
    console.error('[bags:GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch bags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, roaster, city, purchaseDate, weight, price, gift, notes } = body

    if (!name || weight === undefined || weight === null || price === undefined || price === null) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const locationName = city || 'CDMX'
    const locationId = await getOrCreatePurchaseLocationId(locationName)

    const { rows } = await pool.query(
      `INSERT INTO coffee_bags (coffee_name, roaster, purchase_date, weight_grams, price, is_gift, purchase_location_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, roaster || null, purchaseDate || null, weight, price, !!gift, locationId, notes || null]
    )

    return NextResponse.json({
      success: true,
      data: toBag({ ...rows[0], location_name: locationName }),
    })
  } catch (error) {
    console.error('[bags:POST]', error)
    return NextResponse.json({ success: false, error: 'Failed to create bag' }, { status: 500 })
  }
}
