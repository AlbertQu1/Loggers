'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { listarOlvidadas, urlMedia } from '@/services/api/prendas'
import type { Prenda } from '@/types'

function dias(fecha: string | null) {
  return fecha ? Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000) : null
}

function Tarjeta({ p, etiqueta }: { p: Prenda; etiqueta: string }) {
  return (
    <Link href={`/outfit?base=${p.id}`} className="overflow-hidden rounded-2xl border bg-card transition active:scale-[0.98]">
      <div className="relative flex aspect-square items-center justify-center bg-secondary p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urlMedia(p.foto_recortada ?? p.foto_original)} alt="" className="h-full w-full object-contain drop-shadow-md" loading="lazy" />
        <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">{etiqueta}</span>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="truncate text-sm font-medium first-letter:uppercase">{p.subcategoria || p.categoria}</span>
        <Sparkles className="h-4 w-4 shrink-0 text-accent" />
      </div>
    </Link>
  )
}

export function Olvidadas() {
  const [datos, setDatos] = useState<{ dias: number; sin_usar: Prenda[]; nunca_usadas: Prenda[] } | null>(null)

  useEffect(() => {
    listarOlvidadas().then(setDatos).catch(() => setDatos({ dias: 60, sin_usar: [], nunca_usadas: [] }))
  }, [])

  const vacio = datos && datos.sin_usar.length === 0 && datos.nunca_usadas.length === 0

  return (
    <>
      <PageHeader titulo="Olvidadas" subtitulo="Toca una prenda para armar un outfit con ella" />
      {!datos && (
        <div className="grid grid-cols-2 gap-3 px-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary" />)}
        </div>
      )}
      {vacio && (
        <div className="mx-5 flex flex-col items-center gap-4 rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Clock className="h-7 w-7 text-accent" strokeWidth={1.6} />
          </div>
          <p className="font-serif text-xl">Todo en rotación</p>
          <p className="max-w-64 text-sm text-muted-foreground">
            Aquí aparecerá lo que lleves más de {datos.dias} días sin usar. Registra tus outfits con “Me lo puse hoy”.
          </p>
        </div>
      )}
      {datos && datos.sin_usar.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 px-5 font-serif text-xl">Hace tiempo que no las usas</h2>
          <div className="grid grid-cols-2 gap-3 px-5">
            {datos.sin_usar.map((p) => <Tarjeta key={p.id} p={p} etiqueta={`${dias(p.ultimo_uso)} días`} />)}
          </div>
        </section>
      )}
      {datos && datos.nunca_usadas.length > 0 && (
        <section>
          <h2 className="mb-3 px-5 font-serif text-xl">Aún no las estrenas</h2>
          <div className="grid grid-cols-2 gap-3 px-5">
            {datos.nunca_usadas.map((p) => <Tarjeta key={p.id} p={p} etiqueta="sin estrenar" />)}
          </div>
        </section>
      )}
    </>
  )
}
