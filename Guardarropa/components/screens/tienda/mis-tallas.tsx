'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Ruler } from 'lucide-react'
import { formatoTalla } from '@/components/common/talla-input'
import { CATEGORIAS } from '@/lib/categorias'
import { obtenerTallas } from '@/services/api/prendas'
import type { ResumenTallas } from '@/types'

const NOMBRE = Object.fromEntries(CATEGORIAS.map((c) => [c.valor, c.label]))

/** Qué tallas y marcas compras, por categoría: para tenerlo a la mano en la tienda. */
export function MisTallas() {
  const [r, setR] = useState<ResumenTallas | null>(null)

  useEffect(() => {
    obtenerTallas().then(setR).catch(() => setR(null))
  }, [])

  if (!r) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>

  if (r.con_talla === 0 && r.marcas.length === 0) {
    return (
      <div className="mx-5 flex gap-3 rounded-3xl border bg-card p-5 text-sm text-muted-foreground">
        <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <p>
          Aquí verás tus tallas y marcas por tipo de prenda. Agrégalas en el detalle de cada prenda, o escanea su
          etiqueta y Stylo las lee.{' '}
          <Link href="/closet" className="text-foreground underline underline-offset-4">Ir al clóset</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-5">
      {r.categorias.filter((c) => c.tallas.length || c.marcas.length).map((c) => (
        <section key={c.categoria} className="space-y-3 rounded-3xl border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-lg">{NOMBRE[c.categoria]}</h3>
            <span className="text-xs text-muted-foreground">{c.prendas} {c.prendas === 1 ? 'prenda' : 'prendas'}</span>
          </div>
          {c.tallas.length > 0 && (
            <div className="space-y-1.5">
              {c.tallas.map((t, i) => (
                <div key={t.valor} className="flex items-center gap-3">
                  <span className={`min-w-0 flex-1 ${i === 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    {t.valor.includes('/') ? formatoTalla(c.categoria, t.valor) : `Talla ${t.valor}`}
                  </span>
                  <span className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-secondary">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${(t.prendas / c.prendas) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-sm tabular-nums text-muted-foreground">{t.prendas}</span>
                </div>
              ))}
              {c.sin_talla > 0 && <p className="text-xs text-muted-foreground">{c.sin_talla} sin talla registrada</p>}
            </div>
          )}
          {(c.marcas.length > 0 || c.ajustes.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {c.marcas.map((m) => (
                <span key={m.valor} className="rounded-full bg-secondary px-3 py-1 text-sm">
                  {m.valor} <span className="text-muted-foreground">{m.prendas}</span>
                </span>
              ))}
              {c.ajustes.map((a) => (
                <span key={a.valor} className="rounded-full border px-3 py-1 text-sm text-muted-foreground first-letter:uppercase">
                  {a.valor} {a.prendas}
                </span>
              ))}
            </div>
          )}
        </section>
      ))}

      {r.marcas.length > 0 && (
        <section className="space-y-2 rounded-3xl border bg-card p-5">
          <h3 className="font-serif text-lg">Tus marcas</h3>
          <ol className="space-y-1.5">
            {r.marcas.map((m) => (
              <li key={m.marca} className="flex items-baseline gap-3 text-sm">
                <span className="flex-1 font-medium">{m.marca}</span>
                <span className="text-xs text-muted-foreground">{m.categorias.map((c) => NOMBRE[c]?.toLowerCase()).join(', ')}</span>
                <span className="w-6 text-right tabular-nums text-muted-foreground">{m.prendas}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
