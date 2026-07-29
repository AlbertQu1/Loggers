import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // 'Anual' is the internal marker location for the ground-coffee virtual
    // bag (see app/api/ground-coffee/route.ts) — not a real purchase city.
    const { rows } = await pool.query(
      "SELECT id, name FROM purchase_locations WHERE name <> 'Anual' ORDER BY name"
    )
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('[purchase-locations:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase locations' },
      { status: 500 }
    )
  }
}
