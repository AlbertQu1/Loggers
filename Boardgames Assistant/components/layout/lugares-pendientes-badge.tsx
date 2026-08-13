'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPinPlus, X } from 'lucide-react'
import { useLugaresPendientes } from '@/hooks/use-lugares-pendientes'

const ETIQUETA_TIPO: Record<string, string> = {
  compra: 'Fuente de compra',
  lugar_partida: 'Lugar de partida',
}

export function LugaresPendientesBadge() {
  const { pendientes, revisar } = useLugaresPendientes()
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
        title="Lugares nuevos sin categorizar"
      >
        <MapPinPlus className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {pendientes.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border bg-background shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/50">
            <p className="text-sm font-medium">Lugares nuevos por revisar</p>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y">
            {pendientes.map((p) => (
              <li key={`${p.tipo}-${p.valor}`} className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.valor}</p>
                  <p className="text-xs text-muted-foreground truncate">{ETIQUETA_TIPO[p.tipo] ?? p.tipo}</p>
                </div>
                <button
                  onClick={() => revisar(p.tipo, p.valor)}
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
