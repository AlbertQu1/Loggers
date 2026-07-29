import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { toBag } from '@/lib/coffee-mappings'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { rows } = await pool.query(
      `UPDATE coffee_bags
       SET status = 'CLOSED', closed_date = CURRENT_DATE
       WHERE id = $1 AND status = 'ACTIVE'
       RETURNING *`,
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bag not found or not active' },
        { status: 404 }
      )
    }

    const bag = rows[0]
    const loc = await pool.query('SELECT name FROM purchase_locations WHERE id = $1', [
      bag.purchase_location_id,
    ])

    return NextResponse.json({
      success: true,
      data: toBag({ ...bag, location_name: loc.rows[0]?.name || '' }),
    })
  } catch (error) {
    console.error('[bags/finish:PATCH]', error)
    return NextResponse.json({ success: false, error: 'Failed to finish bag' }, { status: 500 })
  }
}
