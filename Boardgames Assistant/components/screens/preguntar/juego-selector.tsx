'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Juego } from '@/types'

export function JuegoSelector({
  juegos,
  value,
  onChange,
}: {
  juegos: Juego[]
  value: string
  onChange: (juego: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const baseGames = useMemo(() => juegos.filter((j) => !j.juego_base), [juegos])

  const expansionCount = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const j of juegos) {
      if (j.juego_base) counts[j.juego_base] = (counts[j.juego_base] || 0) + 1
    }
    return counts
  }, [juegos])

  const results = useMemo(() => {
    if (!query.trim()) return baseGames
    const q = query.toLowerCase()
    return baseGames.filter((j) => j.juego.toLowerCase().includes(q))
  }, [baseGames, query])

  const selected = juegos.find((j) => j.juego === value)

  if (value && selected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
        <span className="text-sm flex-1 truncate">
          🎲 {selected.juego}
          {expansionCount[selected.juego] > 0 && (
            <span className="text-muted-foreground"> (+{expansionCount[selected.juego]} expansion{expansionCount[selected.juego] > 1 ? 'es' : ''})</span>
          )}
        </span>
        <button
          onClick={() => {
            onChange('')
            setQuery('')
          }}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Quitar filtro de juego"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar juego (o deja vacio para buscar en todos)"
          className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-card shadow-lg">
          {results.map((j) => (
            <li key={j.juego}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(j.juego)
                  setQuery('')
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
              >
                {j.juego}
                {expansionCount[j.juego] > 0 && (
                  <span className="text-muted-foreground"> (+{expansionCount[j.juego]} expansion{expansionCount[j.juego] > 1 ? 'es' : ''})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-lg px-3 py-2 text-sm text-muted-foreground">
          Sin resultados
        </div>
      )}
    </div>
  )
}
