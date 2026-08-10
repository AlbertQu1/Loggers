'use client'

import { useMemo, useState } from 'react'
import { Search, X, Sparkles } from 'lucide-react'

export function JuegoCatalogoSelector({
  catalogo,
  value,
  onChange,
  placeholder = 'Buscar en tu biblioteca de BG Stats...',
}: {
  catalogo: string[]
  value: string
  onChange: (juego: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return catalogo.slice(0, 30)
    const q = query.toLowerCase()
    return catalogo.filter((j) => j.toLowerCase().includes(q)).slice(0, 30)
  }, [catalogo, query])

  const coincideExacto = catalogo.some((j) => j.toLowerCase() === query.trim().toLowerCase())
  const enCatalogo = catalogo.some((j) => j.toLowerCase() === value.toLowerCase())

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
        <span className="text-sm flex-1 truncate">
          {enCatalogo ? '🎲' : '✨'} {value}
          {!enCatalogo && <span className="text-muted-foreground"> (nuevo)</span>}
        </span>
        <button type="button" onClick={() => { onChange(''); setQuery('') }} aria-label="Quitar">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {open && (
        <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-card shadow-lg">
          {results.map((j) => (
            <li key={j}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(j); setQuery(''); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
              >
                🎲 {j}
              </button>
            </li>
          ))}
          {results.length === 0 && !query.trim() && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Escribe para buscar</li>
          )}
          {query.trim() && !coincideExacto && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(query.trim()); setQuery(''); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 border-t"
              >
                <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
                Usar &ldquo;{query.trim()}&rdquo; (no está en tu biblioteca)
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
