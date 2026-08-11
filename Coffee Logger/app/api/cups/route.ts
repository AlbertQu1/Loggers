import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import {
  getCupSizeId,
  resolveAlcoholTypes,
  resolveFlavors,
  promoteFrequentOtherFlavors,
} from '@/lib/coffee-mappings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      size,
      cups_prepared,
      cold,
      withMilk,
      useGroundCoffee,
      activeBagId,
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
      `INSERT INTO coffee_preparations (bag_id, cup_size_id, cups_prepared, with_milk, cold_coffee, alcohol_type_ids, other_alcohol, flavor_ids, other_flavor)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        activeBagId || null,
        cupSizeId,
        cups_prepared || 1,
        !!withMilk,
        !!cold,
        alcoholTypeIds.length ? alcoholTypeIds : null,
        otherAlcohol,
        flavorIds.length ? flavorIds : null,
        otherFlavor,
      ]
    )

    if (otherFlavor) {
      await promoteFrequentOtherFlavors()
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
