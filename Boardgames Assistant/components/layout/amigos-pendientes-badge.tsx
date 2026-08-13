'use client'

import { useEffect, useRef, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { useAmigosPendientes } from '@/hooks/use-amigos-pendientes'

export function AmigosPendientesBadge() {
  const { pendientes, revisar } = useAmigosPendientes()
  const [open, setOpen] = useState(false)
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
        title="Amigos nuevos con usuario de BGG"
      >
        <UserPlus className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {pendientes.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border bg-background shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/50">
            <p className="text-sm font-medium">Amigos nuevos con BGG</p>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y">
            {pendientes.map((p) => (
              <li key={p.bgg_username} className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.jugador_nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.bgg_username}</p>
                </div>
                <button
                  onClick={() => revisar(p.bgg_username)}
                  className="p-1.5 rounded hover:bg-muted transition-colors shrink-0"
                  title="Marcar como revisado"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
