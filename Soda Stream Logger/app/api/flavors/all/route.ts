import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { toFlavor } from '@/lib/soda-mappings'

// Every flavor purchase entry, for the management screen (unlike
// GET /api/flavors, which only returns what's currently selectable).
export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM soda_flavors ORDER BY flavor_name, purchase_date DESC NULLS LAST'
    )
    return NextResponse.json({ success: true, data: rows.map(toFlavor) })
  } catch (error) {
    console.error('[flavors/all:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flavors' },
      { status: 500 }
    )
  }
}
