import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { toFlavor } from '@/lib/soda-mappings'

// Every flavor purchase entry, for the management screen (unlike
// GET /api/flavors, which only returns what's currently selectable).
// remaining_ml = ml purchased minus ml used across preparations logged
// against that specific flavor row (NULL when ml wasn't tracked, e.g.
// always_available flavors like Limon Natural).
export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT f.*,
        CASE WHEN f.ml IS NOT NULL THEN
          f.ml - COALESCE((SELECT SUM(p.ml) FROM soda_preparations p WHERE p.flavor_id = f.id), 0)
        END AS remaining_ml
      FROM soda_flavors f
      ORDER BY f.flavor_name, f.purchase_date DESC NULLS LAST
    `)
    return NextResponse.json({ success: true, data: rows.map(toFlavor) })
  } catch (error) {
    console.error('[flavors/all:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flavors' },
      { status: 500 }
    )
  }
}
