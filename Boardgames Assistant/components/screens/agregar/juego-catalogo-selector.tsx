'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, Sparkles, Loader2 } from 'lucide-react'
import { bggBuscar, type BggResultado } from '@/services/api/reglamentos'

const MIN_LETRAS_BGG = 3
const DEBOUNCE_MS = 450

export function JuegoCatalogoSelector({
  catalogo,
  value,
  onChange,
  placeholder = 'Buscar en tu biblioteca o en BoardGameGeek...',
  buscarEnBgg = true,
}: {
  catalogo: string[]
  value: string
  onChange: (juego: string) => void
  placeholder?: string
  buscarEnBgg?: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [bgg, setBgg] = useState<BggResultado[]>([])
  const [buscandoBgg, setBuscandoBgg] = useState(false)
  const [errorBgg, setErrorBgg] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const results = useMemo(() => {
    if (!query.trim()) return catalogo.slice(0, 30)
    const q = query.toLowerCase()
    return catalogo.filter((j) => j.toLowerCase().includes(q)).slice(0, 30)
  }, [catalogo, query])

  // BGG solo entra cuando ya hay algo escrito: es una llamada a un servicio
  // externo, con debounce para no dispararla en cada tecla.
  useEffect(() => {
    const termino = query.trim()
    if (!buscarEnBgg || termino.length < MIN_LETRAS_BGG) {
      setBgg([])
      setErrorBgg(null)
      setBuscandoBgg(false)
      return
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setBuscandoBgg(true)
      setErrorBgg(null)
      bggBuscar(termino, controller.signal)
        .then((res) => {
          setBgg(res)
          setBuscandoBgg(false)
        })
        .catch((err) => {
          if (controller.signal.aborted) return
          setBgg([])
          setErrorBgg(err instanceof Error ? err.message : 'No se pudo buscar en BGG')
          setBuscandoBgg(false)
        })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, buscarEnBgg])

  useEffect(() => () => abortRef.current?.abort(), [])

  // Si el juego ya esta en tu biblioteca sale en la seccion de arriba con su
  // nombre local; repetirlo aqui solo daria dos botones que hacen lo mismo.
  const yaListados = new Set(results.map((j) => j.toLowerCase()))
  const bggNuevos = bgg.filter((r) => !yaListados.has(r.nombre.toLowerCase()))

  const coincideExacto =
    catalogo.some((j) => j.toLowerCase() === query.trim().toLowerCase()) ||
    bgg.some((r) => r.nombre.toLowerCase() === query.trim().toLowerCase())
  const enCatalogo = catalogo.some((j) => j.toLowerCase() === value.toLowerCase())

  function elegir(nombre: string) {
    onChange(nombre)
    setQuery('')
    setBgg([])
    setOpen(false)
  }

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
        {buscandoBgg && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />}
      </div>

      {open && (
        <ul className="absolute z-10 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border bg-card shadow-lg">
          {results.length > 0 && (
            <li className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Tu biblioteca
            </li>
          )}
          {results.map((j) => (
            <li key={j}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(j)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
              >
                🎲 {j}
              </button>
            </li>
          ))}

          {buscarEnBgg && bggNuevos.length > 0 && (
            <li className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground border-t">
              BoardGameGeek
            </li>
          )}
          {buscarEnBgg && bggNuevos.map((r) => (
            <li key={r.bgg_id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(r.nombre)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
              >
                {r.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.thumbnail} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                ) : (
                  <span className="w-8 h-8 rounded bg-muted shrink-0" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{r.nombre}</span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {r.anio ?? 's/f'}
                    {r.es_expansion && ' · expansión'}
                    {r.en_biblioteca && ' · en tu biblioteca'}
                    {r.ya_indexado && ' · ya indexado'}
                  </span>
                </span>
              </button>
            </li>
          ))}

          {buscarEnBgg && buscandoBgg && bggNuevos.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2 border-t">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Buscando en BoardGameGeek...
            </li>
          )}
          {buscarEnBgg && errorBgg && (
            <li className="px-3 py-2 text-xs text-muted-foreground border-t">{errorBgg}</li>
          )}

          {results.length === 0 && !query.trim() && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Escribe para buscar</li>
          )}
          {query.trim() && !coincideExacto && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(query.trim())}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 border-t"
              >
                <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
                Usar &ldquo;{query.trim()}&rdquo; tal cual
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
