import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shotsLight, shotsMedium, shotsStrong, bottlesPrepared, flavorId, ml } = body

    const light = Number(shotsLight) || 0
    const medium = Number(shotsMedium) || 0
    const strong = Number(shotsStrong) || 0

    if (light + medium + strong <= 0) {
      return NextResponse.json(
        { success: false, error: 'At least one shot is required' },
        { status: 400 }
      )
    }

    const activeRes = await pool.query(`SELECT id FROM soda_cylinders WHERE status = 'ACTIVE'`)
    if (activeRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active cylinder. Add or change to a tank first.' },
        { status: 409 }
      )
    }
    const cylinderId = activeRes.rows[0].id

    const { rows } = await pool.query(
      `INSERT INTO soda_preparations (cylinder_id, shots_light, shots_medium, shots_strong, bottles_prepared, flavor_id, ml)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [cylinderId, light, medium, strong, bottlesPrepared || 1, flavorId || null, flavorId ? ml || null : null]
    )

    const row = rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: String(row.id),
        cylinderId: String(row.cylinder_id),
        shotsLight: row.shots_light,
        shotsMedium: row.shots_medium,
        shotsStrong: row.shots_strong,
        bottlesPrepared: row.bottles_prepared,
        flavorId: row.flavor_id ? String(row.flavor_id) : undefined,
        timestamp: row.prepared_timestamp.toISOString(),
        createdAt: row.prepared_timestamp.toISOString(),
      },
    })
  } catch (error) {
    console.error('[preparations:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register preparation' },
      { status: 500 }
    )
  }
}
