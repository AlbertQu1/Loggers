import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { toCylinder } from '@/lib/soda-mappings'

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM soda_cylinders ORDER BY id DESC')
    return NextResponse.json({ success: true, data: rows.map(toCylinder) })
  } catch (error) {
    console.error('[cylinders:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cylinders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { price, notes, quantity } = body

    const qty = Math.min(5, Math.max(1, parseInt(quantity) || 1))
    const created = []

    for (let i = 0; i < qty; i++) {
      const { rows } = await pool.query(
        `INSERT INTO soda_cylinders (price, notes)
         VALUES ($1, $2)
         RETURNING *`,
        [price || 0, notes || null]
      )
      created.push(toCylinder(rows[0]))
    }

    return NextResponse.json({ success: true, data: created })
  } catch (error) {
    console.error('[cylinders:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create cylinder' },
      { status: 500 }
    )
  }
}
