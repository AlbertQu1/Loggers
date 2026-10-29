'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { ColorDots } from '@/components/common/color-dots'
import { CATEGORIAS } from '@/lib/categorias'
import { listarPrendas, urlMedia } from '@/services/api/prendas'
import type { Prenda } from '@/types'

interface Props {
  seleccion: number[]
  onToggle: (p: Prenda) => void
  multiple?: boolean
  categoriasPermitidas?: string[]
}

/** Grid de prendas del clóset con filtro por categoría. Sirve para elegir una o varias. */
export function PrendaPicker({ seleccion, onToggle, multiple = false, categoriasPermitidas }: Props) {
  const [prendas, setPrendas] = useState<Prenda[] | null>(null)
  const [categoria, setCategoria] = useState('')

  useEffect(() => {
    listarPrendas().then(setPrendas).catch(() => setPrendas([]))
  }, [])

  const cats = CATEGORIAS.filter((c) => !categoriasPermitidas || categoriasPermitidas.includes(c.valor))
  const visibles = useMemo(
    () =>
      (prendas ?? []).filter(
        (p) => (!categoria || p.categoria === categoria) && (!categoriasPermitidas || categoriasPermitidas.includes(p.categoria)),
      ),
    [prendas, categoria, categoriasPermitidas],
  )

  return (
    <div className="space-y-4">
      <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5">
        {[{ valor: '', label: 'Todo' }, ...cats].map((c) => (
          <button
            key={c.valor}
            onClick={() => setCategoria(c.valor)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
              categoria === c.valor ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {prendas === null ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No hay prendas aquí todavía.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {visibles.map((p) => {
            const elegida = seleccion.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p)}
                className={`relative overflow-hidden rounded-2xl border bg-card text-left transition active:scale-[0.97] ${
                  elegida ? 'border-primary ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex aspect-square items-center justify-center bg-secondary p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlMedia(p.foto_recortada ?? p.foto_original)} alt="" className="h-full w-full object-contain" loading="lazy" />
                </div>
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <span className="truncate text-[11px] font-medium first-letter:uppercase">{p.subcategoria || p.categoria}</span>
                  <ColorDots colores={p.colores} max={2} />
                </div>
                {multiple && elegida && (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
