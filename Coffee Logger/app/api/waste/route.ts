import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { dateToISODate } from '@/lib/coffee-mappings'

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT w.waste_date, w.grams_lost, w.reason, cb.coffee_name
      FROM waste w
      JOIN coffee_bags cb ON cb.id = w.bag_id
      ORDER BY w.waste_date DESC
      LIMIT 5
    `)

    return NextResponse.json({
      success: true,
      data: rows.map((row) => ({
        date: dateToISODate(row.waste_date),
        coffeeName: row.coffee_name,
        grams: row.grams_lost,
        reason: row.reason || undefined,
      })),
    })
  } catch (error) {
    console.error('[waste:GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch waste history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coffeeBagId, date, grams, reason, notes } = body

    if (!coffeeBagId || !date || !grams) {
      return NextResponse.json(
        { success: false, error: 'Missing bag, date, or grams' },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `INSERT INTO waste (bag_id, waste_date, grams_lost, reason, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [coffeeBagId, date, grams, reason || null, notes || null]
    )

    const row = rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: String(row.id),
        coffeeBagId: String(row.bag_id),
        date: dateToISODate(row.waste_date),
        grams: row.grams_lost,
        reason: row.reason || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.created_at.toISOString(),
      },
    })
  } catch (error) {
    console.error('[waste:POST]', error)
    return NextResponse.json({ success: false, error: 'Failed to register waste' }, { status: 500 })
  }
}
