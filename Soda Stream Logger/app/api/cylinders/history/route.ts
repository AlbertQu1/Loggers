import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { dateToISODate } from '@/lib/soda-mappings'

// Yield per cylinder: historical_liters (pre-tracking era, see migracion.py
// + migration 0009) plus whatever's been logged in soda_preparations since
// -- the two never overlap the same rows, so summing them is safe.
export async function GET() {
  try {
    const { rows: cylinders } = await pool.query(`
      SELECT c.id, c.label, c.status, c.opened_date,
        COALESCE(c.historical_liters, 0) + COALESCE(SUM(p.bottles_prepared), 0) AS total_liters
      FROM soda_cylinders c
      LEFT JOIN soda_preparations p ON p.cylinder_id = c.id
      WHERE c.status IN ('CLOSED', 'ACTIVE')
      GROUP BY c.id
      ORDER BY c.id
    `)

    const closed = cylinders.filter((c) => c.status === 'CLOSED')
    const active = cylinders.find((c) => c.status === 'ACTIVE')

    let activeData = null
    if (active) {
      const { rows: preparations } = await pool.query(
        `SELECT p.id, p.prepared_timestamp, p.shots_light, p.shots_medium, p.shots_strong,
                p.bottles_prepared, f.flavor_name
         FROM soda_preparations p
         LEFT JOIN soda_flavors f ON f.id = p.flavor_id
         WHERE p.cylinder_id = $1
         ORDER BY p.prepared_timestamp DESC`,
        [active.id]
      )

      const avgClosed = closed.length
        ? closed.reduce((sum, c) => sum + Number(c.total_liters), 0) / closed.length
        : null
      const activeTotalLiters = Number(active.total_liters)

      activeData = {
        id: String(active.id),
        label: active.label,
        openedDate: dateToISODate(active.opened_date),
        totalLiters: activeTotalLiters,
        predictedTotal: avgClosed,
        predictedRemaining: avgClosed !== null ? Math.max(0, avgClosed - activeTotalLiters) : null,
        preparations: preparations.map((p) => ({
          id: String(p.id),
          timestamp: p.prepared_timestamp.toISOString(),
          shotsLight: p.shots_light,
          shotsMedium: p.shots_medium,
          shotsStrong: p.shots_strong,
          bottlesPrepared: p.bottles_prepared,
          flavorName: p.flavor_name,
        })),
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        closed: closed.map((c) => ({
          id: String(c.id),
          label: c.label,
          totalLiters: Number(c.total_liters),
        })),
        active: activeData,
      },
    })
  } catch (error) {
    console.error('[cylinders/history:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cylinder history' },
      { status: 500 }
    )
  }
}
