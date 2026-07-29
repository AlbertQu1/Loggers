import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, name FROM alcohol_types ORDER BY name'
    )
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('[alcohol-types:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alcohol types' },
      { status: 500 }
    )
  }
}
