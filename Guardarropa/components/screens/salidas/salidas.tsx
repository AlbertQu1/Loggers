'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Undo2 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { showToast } from '@/components/common/toast-notifications'
import { MOTIVOS_BAJA } from '@/lib/categorias'
import { listarBajas, restaurarPrenda, urlMedia } from '@/services/api/prendas'
import type { Baja } from '@/types'

const ETIQUETA: Record<string, string> = Object.fromEntries([...MOTIVOS_BAJA.map((m) => [m.valor, m.label]), ['sin_motivo', 'Sin motivo']])

const fecha = (f: string) => new Date(f.length === 10 ? `${f}T12:00:00` : f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

function tiempoEnCloset(b: Baja) {
  if (!b.baja_fecha) return null
  const meses = Math.round((new Date(b.baja_fecha).getTime() - new Date(b.created_at).getTime()) / (30.4 * 86_400_000))
  if (meses < 1) return 'menos de un mes en el clóset'
  return meses < 12 ? `${meses} ${meses === 1 ? 'mes' : 'meses'} en el clóset` : `${(meses / 12).toFixed(1).replace('.0', '')} años en el clóset`
}

export function Salidas() {
  const [datos, setDatos] = useState<{ resumen: Record<string, number>; bajas: Baja[] } | null>(null)
  const [filtro, setFiltro] = useState('')
  const [regresando, setRegresando] = useState<number | null>(null)

  const cargar = () =>
    listarBajas().then(setDatos).catch((err) => {
      showToast(`No se pudo cargar: ${(err as Error).message}`, 'error')
      setDatos({ resumen: {}, bajas: [] })
    })

  useEffect(() => { cargar() }, [])

  async function regresar(b: Baja) {
    if (!confirm('¿Regresar esta prenda al clóset?')) return
    setRegresando(b.id)
    try {
      await restaurarPrenda(b.id)
      showToast('De vuelta en el clóset', 'success')
      await cargar()
    } catch (err) {
      showToast(`No se pudo regresar: ${(err as Error).message}`, 'error')
    } finally {
      setRegresando(null)
    }
  }

  const lista = (datos?.bajas ?? []).filter((b) => !filtro || (b.baja_motivo ?? 'sin_motivo') === filtro)
  const total = datos?.bajas.length ?? 0

  return (
    <>
      <PageHeader
        titulo="Salidas"
        subtitulo={datos ? (total ? `${total} ${total === 1 ? 'prenda ha salido' : 'prendas han salido'} del clóset` : ' ') : ' '}
      >
        <Link href="/closet" className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Clóset
        </Link>
      </PageHeader>

      {!datos && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}

      {datos && total === 0 && (
        <p className="mx-5 rounded-3xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Aquí aparece lo que sacas del clóset (regalado, donado, vendido, roto…) con el motivo y cuánto lo usaste.
          Para sacar algo, ábrelo en el clóset y toca “Sacar del clóset”.
        </p>
      )}

      {datos && total > 0 && (
        <>
          <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-5">
            {[['', total] as const, ...Object.entries(datos.resumen).sort((a, b) => b[1] - a[1])].map(([m, n]) => (
              <button
                key={m}
                onClick={() => setFiltro(m)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                  filtro === m ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
                }`}
              >
                {m ? ETIQUETA[m] ?? m : 'Todo'} <span className="opacity-60">{n}</span>
              </button>
            ))}
          </div>
          <ul className="space-y-3 px-5">
            {lista.map((b) => (
              <li key={b.id} className="flex gap-3 rounded-3xl border bg-card p-3">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlMedia(b.foto_recortada ?? b.foto_original)} alt="" className="h-full w-full object-contain grayscale-[40%]" loading="lazy" />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5 py-0.5">
                  <p className="truncate font-medium first-letter:uppercase">{b.subcategoria || b.categoria}</p>
                  <p className="text-sm">
                    <span className="text-accent">{ETIQUETA[b.baja_motivo ?? 'sin_motivo']}</span>
                    {b.baja_fecha && <span className="text-muted-foreground"> · {fecha(b.baja_fecha)}</span>}
                  </p>
                  {b.baja_nota && <p className="truncate text-sm text-muted-foreground">{b.baja_nota}</p>}
                  <p className="text-xs text-muted-foreground">
                    {b.veces_usada === 0 ? 'Nunca se usó' : `Usada ${b.veces_usada} ${b.veces_usada === 1 ? 'vez' : 'veces'}`}
                    {tiempoEnCloset(b) && ` · ${tiempoEnCloset(b)}`}
                  </p>
                </div>
                <button
                  onClick={() => regresar(b)} disabled={regresando === b.id}
                  className="self-center rounded-full p-2 text-muted-foreground" aria-label="Regresar al clóset"
                >
                  {regresando === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
