'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'
import { TopLugar } from '@/services/api/bgstats'

const MapaLugares = dynamic(() => import('./mapa-lugares').then((m) => m.MapaLugares), { ssr: false })

export function TopLugaresCard({ items }: { items: TopLugar[] }) {
  const [mostrarLugares, setMostrarLugares] = useState(false)
  const maxPartidas = items[0]?.partidas || 1

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium">Top lugares</p>
      </div>

      <MapaLugares items={items} />

      <button
        type="button"
        onClick={() => setMostrarLugares((v) => !v)}
        className="flex items-center gap-2 w-full text-left mt-1"
      >
        {mostrarLugares ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <p className="text-sm font-medium">Lugares ({items.length})</p>
      </button>

      {mostrarLugares && (
        <div className="flex flex-col divide-y mt-2">
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
      )}
    </div>
  )
}
