import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { toBag } from '@/lib/coffee-mappings'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const activeCheck = await pool.query(
      "SELECT id FROM coffee_bags WHERE status = 'ACTIVE'"
    )
    if (activeCheck.rows.length > 0 && String(activeCheck.rows[0].id) !== id) {
      return NextResponse.json(
        { success: false, error: 'Another bag is already active. Finish it first.' },
        { status: 409 }
      )
    }

    const { rows } = await pool.query(
      `UPDATE coffee_bags
       SET status = 'ACTIVE', opened_date = CURRENT_DATE
       WHERE id = $1 AND status = 'PENDING'
       RETURNING *`,
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bag not found or not pending' },
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
    console.error('[bags/open:PATCH]', error)
    return NextResponse.json({ success: false, error: 'Failed to open bag' }, { status: 500 })
  }
}
