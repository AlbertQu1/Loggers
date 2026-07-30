import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    await pool.query('SELECT 1')
    return NextResponse.json({ success: true, status: 'connected' })
  } catch (error) {
    return NextResponse.json(
      { success: false, status: 'offline' },
      { status: 503 }
    )
  }
}
