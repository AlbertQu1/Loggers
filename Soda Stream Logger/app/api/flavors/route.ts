import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { toFlavor } from '@/lib/soda-mappings'

// Only flavors currently selectable in New Soda: always-available ones
// (e.g. Limon, fresh-squeezed, no cost to track) or ones with no
// finished_date yet (still in stock).
export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM soda_flavors
      WHERE always_available = true OR finished_date IS NULL
      ORDER BY flavor_name
    `)
    return NextResponse.json({ success: true, data: rows.map(toFlavor) })
  } catch (error) {
    console.error('[flavors:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flavors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, brand, cost, ml, purchaseDate } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Missing name' }, { status: 400 })
    }

    const { rows } = await pool.query(
      `INSERT INTO soda_flavors (flavor_name, brand, cost, ml, purchase_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, brand || null, cost ?? null, ml ?? null, purchaseDate || new Date().toISOString().split('T')[0]]
    )

    return NextResponse.json({ success: true, data: toFlavor(rows[0]) })
  } catch (error) {
    console.error('[flavors:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create flavor' },
      { status: 500 }
    )
  }
}
