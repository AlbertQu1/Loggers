'use client'

import { Gamepad2 } from 'lucide-react'
import { TopJuego } from '@/services/api/bgstats'

export function TopJuegosCard({ items }: { items: TopJuego[] }) {
  const maxPartidas = items[0]?.partidas || 1

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2 className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium">Top juegos</p>
      </div>
      <div className="flex flex-col divide-y">
        {items.map((j) => (
          <div key={j.juego} className="py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm truncate">{j.juego}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {j.partidas} partidas · {j.horas}h
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (j.partidas / maxPartidas) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
