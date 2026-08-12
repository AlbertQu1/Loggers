'use client'

import { useEffect, useState } from 'react'
import { Gamepad2 } from 'lucide-react'
import { getTopJuegos, TopJuego, ModoTopJuegos } from '@/services/api/bgstats'
import { showToast } from '@/components/common/toast-notifications'

const MODOS: { valor: ModoTopJuegos; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'solo', label: 'Solo' },
]

export function TopJuegosCard() {
  const [modo, setModo] = useState<ModoTopJuegos>('todos')
  const [items, setItems] = useState<TopJuego[] | null>(null)

  useEffect(() => {
    getTopJuegos(modo)
      .then(setItems)
      .catch((err) => showToast(err instanceof Error ? err.message : 'No se pudo cargar el top de juegos', 'error'))
  }, [modo])

  const maxPartidas = items?.[0]?.partidas || 1

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <Gamepad2 className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium">Top juegos</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {modo === 'todos'
          ? 'Ranking de todos tus juegos por numero de partidas.'
          : 'Partidas sin companero humano real: solitario puro o contra el bot del Automa.'}
      </p>

      <div className="flex rounded-lg border p-0.5 mb-3 w-fit">
        {MODOS.map((m) => (
          <button
            key={m.valor}
            type="button"
            onClick={() => setModo(m.valor)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              modo === m.valor ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {items && items.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">Sin partidas en esta categoría.</p>
      )}

      <div className="flex flex-col divide-y">
        {items?.map((j) => (
          <div key={j.juego} className="py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm truncate">
                {j.juego}
                {j.digital && <span className="text-muted-foreground"> (Digital)</span>}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {j.partidas} partidas · {j.horas}h
              </span>
            </div>
            {j.bots && !j.digital && <p className="text-xs text-muted-foreground mt-0.5">🤖 {j.bots}</p>}
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
