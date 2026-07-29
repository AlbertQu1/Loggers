import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { dateToISODate } from '@/lib/coffee-mappings'

const CLEAN_THRESHOLD = 200
const DESCALE_THRESHOLD = 600

// Same logic as calcular_tazas_desde_mant() in coffee_WIP.py: find the most
// recent maintenance event of a type, then sum every cup made since that
// date. No record of that type yet -> no reference date -> cupsSince is 0
// and the alert can't fire (matches the Python script's behavior of
// returning None when the maintenance sheet has no row for that type).
async function cupsSince(type: 'CLEAN' | 'DESCALE'): Promise<{ cups: number; lastDate: string | null }> {
  const lastRes = await pool.query(
    'SELECT MAX(performed_date) as last_date FROM maintenance WHERE maintenance_type = $1',
    [type]
  )
  const lastDate = lastRes.rows[0]?.last_date
  if (!lastDate) {
    return { cups: 0, lastDate: null }
  }

  const cupsRes = await pool.query(
    'SELECT COALESCE(SUM(cups_prepared), 0) as cups FROM coffee_preparations WHERE prepared_timestamp >= $1',
    [lastDate]
  )

  return { cups: Number(cupsRes.rows[0].cups), lastDate: dateToISODate(lastDate) }
}

export async function GET() {
  try {
    const clean = await cupsSince('CLEAN')
    const descale = await cupsSince('DESCALE')

    return NextResponse.json({
      success: true,
      data: {
        cupsSinceClean: clean.cups,
        cupsSinceDescale: descale.cups,
        needsClean: clean.lastDate !== null && clean.cups >= CLEAN_THRESHOLD,
        needsDescale: descale.lastDate !== null && descale.cups >= DESCALE_THRESHOLD,
        lastCleanDate: clean.lastDate,
        lastDescaleDate: descale.lastDate,
      },
    })
  } catch (error) {
    console.error('[maintenance/status:GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance status' },
      { status: 500 }
    )
  }
}
