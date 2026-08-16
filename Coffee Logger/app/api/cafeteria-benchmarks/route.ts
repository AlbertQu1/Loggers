import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

function toBenchmark(row: any) {
  return {
    id: String(row.id),
    year: row.created_at.getFullYear(),
    cafeteriaName: row.cafeteria_name,
    city: row.city,
    price: Number(row.price),
    latitude: row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== null ? Number(row.longitude) : null,
    createdAt: row.created_at.toISOString(),
  }
}

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM cafeteria_benchmarks ORDER BY created_at DESC LIMIT 20'
    )
    return NextResponse.json({ success: true, data: rows.map(toBenchmark) })
  } catch (error) {
    console.error('[cafeteria-benchmarks:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cafeteria benchmarks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cafeteriaName, city, price, latitude, longitude } = body

    if (!cafeteriaName || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'Missing cafeteriaName or price' },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `INSERT INTO cafeteria_benchmarks (cafeteria_name, city, price, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cafeteriaName, city || 'CDMX', price, latitude ?? null, longitude ?? null]
    )

    return NextResponse.json({ success: true, data: toBenchmark(rows[0]) })
  } catch (error) {
    console.error('[cafeteria-benchmarks:POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register cafeteria benchmark' },
      { status: 500 }
    )
  }
}
