'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import { TopLugar } from '@/services/api/bgstats'

const MapaLugares = dynamic(() => import('./mapa-lugares').then((m) => m.MapaLugares), { ssr: false })

export function TopLugaresCard({ items }: { items: TopLugar[] }) {
  const maxPartidas = items[0]?.partidas || 1

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium">Top lugares</p>
      </div>

      <MapaLugares items={items} />

      <div className="flex flex-col divide-y">
        {items.map((l) => (
          <div key={l.lugar} className="py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm truncate flex items-center gap-1">
                {l.lugar}
                {l.lat != null && <span className="text-muted-foreground" title="Geolocalizado">📍</span>}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">{l.partidas} partidas</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (l.partidas / maxPartidas) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
