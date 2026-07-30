import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { toCylinder } from '@/lib/soda-mappings'

// Single-button "change tank": closes whatever cylinder is currently
// active (if any) and activates the oldest pending one in the same
// action. Fails clearly if there's nothing pending to switch to.
export async function POST() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const pendingRes = await client.query(
      `SELECT id FROM soda_cylinders WHERE status = 'PENDING' ORDER BY purchase_date ASC, id ASC LIMIT 1`
    )
    if (pendingRes.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { success: false, error: 'No pending cylinders available. Add a new one first.' },
        { status: 409 }
      )
    }
    const nextId = pendingRes.rows[0].id

    await client.query(
      `UPDATE soda_cylinders SET status = 'CLOSED', closed_date = CURRENT_DATE WHERE status = 'ACTIVE'`
    )

    const { rows } = await client.query(
      `UPDATE soda_cylinders SET status = 'ACTIVE', opened_date = CURRENT_DATE WHERE id = $1 RETURNING *`,
      [nextId]
    )

    await client.query('COMMIT')
    return NextResponse.json({ success: true, data: toCylinder(rows[0]) })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[cylinders/change-tank:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to change tank' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
