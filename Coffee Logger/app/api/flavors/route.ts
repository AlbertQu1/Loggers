import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, name FROM flavors ORDER BY display_order NULLS LAST, name'
    )
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('[flavors:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flavors' },
      { status: 500 }
    )
  }
}
