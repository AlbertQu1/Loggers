import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT bp.predicted_total_cups, bp.predicted_cycle_days, bp.prediction_date,
             cb.coffee_name
      FROM bag_predictions bp
      JOIN coffee_bags cb ON cb.id = bp.bag_id
      WHERE cb.status = 'ACTIVE'
      ORDER BY bp.id DESC
      LIMIT 1
    `)

    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: null })
    }

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('[bag-predictions/latest:GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch prediction' }, { status: 500 })
  }
}
