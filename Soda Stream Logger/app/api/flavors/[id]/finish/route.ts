import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { rows } = await pool.query(
      `UPDATE soda_flavors
       SET finished_date = CURRENT_DATE
       WHERE id = $1 AND finished_date IS NULL
       RETURNING id`,
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Flavor not found or already finished' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: { id: String(rows[0].id) } })
  } catch (error) {
    console.error('[flavors/[id]/finish:PATCH]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to finish flavor' },
      { status: 500 }
    )
  }
}
