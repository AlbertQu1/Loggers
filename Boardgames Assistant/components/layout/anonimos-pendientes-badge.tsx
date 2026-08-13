'use client'

import { useEffect, useRef, useState } from 'react'
import { UsersRound } from 'lucide-react'
import { useAnonimosPendientes } from '@/hooks/use-anonimos-pendientes'

const GRUPOS_SOCIALES = [
  'Reformers', 'Pup', 'Cartoneros', 'GEM', 'Entreturnos', 'Cdmx', 'Cul',
  'Cun', 'Gdl', 'Mty', 'Evento', 'Solo', 'Otros', 'Extra', 'Ex',
]

export function AnonimosPendientesBadge() {
  const { pendientes, revisar } = useAnonimosPendientes()
  const [open, setOpen] = useState(false)
  const [seleccion, setSeleccion] = useState<Record<string, string>>({})
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (pendientes.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        title="Partidas anonimas sin grupo social"
      >
        <UsersRound className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 z-10 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {pendientes.length}
        </span>
      </button>

      {open && (
        <div className="fixed top-16 right-3 w-80 max-w-[calc(100vw-1.5rem)] rounded-lg border bg-background shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/50">
            <p className="text-sm font-medium">Partidas sin grupo social</p>
          </div>
          <ul className="max-h-96 overflow-y-auto divide-y">
            {pendientes.map((p) => (
              <li key={p.partida_uuid} className="px-3 py-2 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{p.juego}</p>
                  <span className="text-[10px] uppercase text-muted-foreground shrink-0">{p.tipo}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {p.fecha.slice(0, 10)} · {p.lugar ?? 'sin lugar'}
                </p>
                {p.jugadores_con_grupo && (
                  <p className="text-xs text-muted-foreground truncate">{p.jugadores_con_grupo}</p>
                )}
                <div className="flex items-center gap-2">
                  <select
                    value={seleccion[p.partida_uuid] ?? ''}
                    onChange={(e) =>
                      setSeleccion((prev) => ({ ...prev, [p.partida_uuid]: e.target.value }))
                    }
                    className="flex-1 text-xs rounded border bg-background px-2 py-1"
                  >
                    <option value="">Elegir grupo...</option>
                    {GRUPOS_SOCIALES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <button
                    disabled={!seleccion[p.partida_uuid]}
                    onClick={() => revisar(p.partida_uuid, seleccion[p.partida_uuid])}
                    className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
                  >
                    OK
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
