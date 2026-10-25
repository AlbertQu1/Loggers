import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import pool from '@/lib/db'
import {
  getCupSizeId,
  resolveAlcoholTypes,
  resolveFlavors,
  promoteFrequentOtherFlavors,
  getOrCreateAnnualGroundCoffeeBagId,
} from '@/lib/coffee-mappings'

// Refreshes the active bag's cups/duration prediction right after a real cup
// gets logged, instead of on a timer -- coffee doesn't get made every day, so
// a fixed schedule would either lag behind or refresh for nothing. Fire-and-
// forget: never blocks or fails the cup registration itself.
function triggerBagPrediction() {
  try {
    const child = spawn(
      '/home/albertqu/miniconda3/envs/cafe/bin/python3',
      ['/home/albertqu/Loggers/Coffee Logger/scripts/predict_active_bag.py'],
      { detached: true, stdio: 'ignore' }
    )
    child.unref()
  } catch (error) {
    console.error('[cups:POST] failed to trigger bag prediction', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      size,
      cups_prepared,
      prepared_timestamp,
      cold,
      withMilk,
      useGroundCoffee,
      activeBagId,
      noCoffee,
      contains_alcohol,
      alcohol_types,
      contains_flavor,
      flavors,
    } = body

    if (!size) {
      return NextResponse.json(
        { success: false, error: 'Missing size' },
        { status: 400 }
      )
    }

    // Every cup must be attributable to a bag, except the legitimate
    // no-coffee case (noCoffee=true), where bag_id must stay null. If
    // activeBagId is missing for any other reason -- the frontend's ground-
    // coffee fallback should have supplied it, but can't be trusted blindly
    // if its own lookup raced or failed -- resolve the current year's
    // "Molido <year>" bag here instead of silently storing an orphaned row.
    let resolvedBagId = activeBagId || null
    if (!resolvedBagId && !noCoffee) {
      resolvedBagId = await getOrCreateAnnualGroundCoffeeBagId()
    }

    // Tap-time timestamp from the client (survives offline-queue retries).
    // Anything missing, unparseable or in the future falls back to now().
    const parsedTs = prepared_timestamp ? new Date(prepared_timestamp) : null
    const preparedTs =
      parsedTs && !isNaN(parsedTs.getTime()) && parsedTs.getTime() <= Date.now() + 5 * 60 * 1000
        ? parsedTs.toISOString()
        : null

    const cupSizeId = await getCupSizeId(size)

    let alcoholTypeIds: number[] = []
    let otherAlcohol: string | null = null
    if (contains_alcohol && Array.isArray(alcohol_types) && alcohol_types.length > 0) {
      const resolved = await resolveAlcoholTypes(alcohol_types)
      alcoholTypeIds = resolved.alcoholTypeIds
      otherAlcohol = resolved.otherAlcohol
    }

    let flavorIds: number[] = []
    let otherFlavor: string | null = null
    if (contains_flavor && Array.isArray(flavors) && flavors.length > 0) {
      const resolved = await resolveFlavors(flavors)
      flavorIds = resolved.flavorIds
      otherFlavor = resolved.otherFlavor
    }

    const { rows } = await pool.query(
      `INSERT INTO coffee_preparations (bag_id, cup_size_id, cups_prepared, with_milk, cold_coffee, alcohol_type_ids, other_alcohol, flavor_ids, other_flavor, prepared_timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, now()))
       RETURNING *`,
      [
        resolvedBagId,
        cupSizeId,
        cups_prepared || 1,
        !!withMilk,
        !!cold,
        alcoholTypeIds.length ? alcoholTypeIds : null,
        otherAlcohol,
        flavorIds.length ? flavorIds : null,
        otherFlavor,
        preparedTs,
      ]
    )

    if (otherFlavor) {
      await promoteFrequentOtherFlavors()
    }

    if (resolvedBagId) {
      triggerBagPrediction()
    }

    const row = rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: String(row.id),
        size,
        cups_prepared: row.cups_prepared,
        cold: row.cold_coffee,
        withMilk: row.with_milk,
        useGroundCoffee: !!useGroundCoffee,
        activeBagId: String(row.bag_id),
        contains_alcohol: !!contains_alcohol,
        alcohol_types: alcohol_types || undefined,
        contains_flavor: !!contains_flavor,
        flavors: flavors || undefined,
        timestamp: row.prepared_timestamp.toISOString(),
        createdAt: row.prepared_timestamp.toISOString(),
        updatedAt: row.prepared_timestamp.toISOString(),
      },
    })
  } catch (error) {
    console.error('[cups:POST]', error)
    return NextResponse.json({ success: false, error: 'Failed to register cup' }, { status: 500 })
  }
}
