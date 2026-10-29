'use client'

import { useState } from 'react'
import type { Categoria } from '@/types'

const input =
  'w-full rounded-xl border bg-card px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25'

/** Prendas que se compran por dos medidas en vez de una talla (camisa: cuello/manga; pantalón: cintura/largo). */
export const MEDIDAS: Partial<Record<Categoria, [string, string, string, string]>> = {
  top: ['Cuello y manga', 'Cuello', 'Manga', 'ej. 15.5 o 39'],
  chamarra: ['Pecho y manga', 'Pecho', 'Manga', 'ej. 40 o 102'],
  bottom: ['Cintura y largo', 'Cintura', 'Largo', 'ej. 32'],
}

/** "15.5/32-33" en una camisa -> "Cuello 15.5 · Manga 32-33". */
export function formatoTalla(categoria: Categoria, talla: string | null) {
  if (!talla) return ''
  const m = MEDIDAS[categoria]
  const partes = talla.split('/')
  if (m && partes.length === 2 && /\d/.test(partes[0])) return `${m[1]} ${partes[0]} · ${m[2]} ${partes[1]}`
  return talla
}

export function TallaInput({ categoria, valor, onChange, sugerencias = [] }: {
  categoria: Categoria
  valor: string | null
  onChange: (v: string | null) => void
  sugerencias?: string[]
}) {
  const medidas = MEDIDAS[categoria]
  const [porMedidas, setPorMedidas] = useState(() => !!medidas && (valor ?? '').includes('/'))
  const usarMedidas = !!medidas && porMedidas
  const [a, b] = (valor ?? '').split('/')

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Talla</span>
        {medidas && (
          <button
            type="button"
            onClick={() => { setPorMedidas(!porMedidas); onChange(null) }}
            className="text-xs text-accent underline-offset-4 hover:underline"
          >
            {usarMedidas ? 'Usar talla (S, M, 32…)' : `Por ${medidas[0].toLowerCase()}`}
          </button>
        )}
      </div>
      {usarMedidas ? (
        <div className="grid grid-cols-2 gap-3">
          {[medidas![1], medidas![2]].map((label, i) => (
            <label key={label} className="space-y-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <input
                className={input} inputMode="decimal"
                placeholder={i === 0 ? medidas![3] : 'ej. 32-33'}
                value={(i === 0 ? a : b) ?? ''}
                onChange={(e) => {
                  const nuevo = i === 0 ? [e.target.value, b ?? ''] : [a ?? '', e.target.value]
                  onChange(nuevo.some((x) => x.trim()) ? nuevo.map((x) => x.trim()).join('/') : null)
                }}
              />
            </label>
          ))}
        </div>
      ) : (
        <>
          <input
            className={input} list="tallas-conocidas" placeholder="ej. M, 32, 27.5" autoCapitalize="characters"
            value={valor ?? ''} onChange={(e) => onChange(e.target.value || null)}
          />
          <datalist id="tallas-conocidas">
            {sugerencias.filter((t) => !t.includes('/')).map((t) => <option key={t} value={t} />)}
          </datalist>
        </>
      )}
    </div>
  )
}
