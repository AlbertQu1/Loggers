import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { dateToISODate } from '@/lib/coffee-mappings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { maintenanceType, date, notes } = body

    if (maintenanceType !== 'CLEAN' && maintenanceType !== 'DESCALE') {
      return NextResponse.json(
        { success: false, error: "maintenanceType must be 'CLEAN' or 'DESCALE'" },
        { status: 400 }
      )
    }
    if (!date) {
      return NextResponse.json({ success: false, error: 'Missing date' }, { status: 400 })
    }

    const { rows } = await pool.query(
      `INSERT INTO maintenance (maintenance_type, performed_date, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [maintenanceType, date, notes || null]
    )

    const row = rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: String(row.id),
        maintenanceType: row.maintenance_type,
        date: dateToISODate(row.performed_date),
        notes: row.notes || undefined,
        createdAt: row.created_at.toISOString(),
      },
    })
  } catch (error) {
    console.error('[maintenance:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register maintenance' },
      { status: 500 }
    )
  }
}
