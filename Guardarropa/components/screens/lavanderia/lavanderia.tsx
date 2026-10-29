'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, BookOpen, Hand, Loader2, Shirt, Thermometer, WashingMachine } from 'lucide-react'
import { showToast } from '@/components/common/toast-notifications'
import { PageHeader } from '@/components/common/page-header'
import { PrendaPicker } from '@/components/common/prenda-picker'
import { armarCargas, urlMedia } from '@/services/api/prendas'
import type { Carga } from '@/types'

const ICONO = { maquina: WashingMachine, mano: Hand, tintoreria: Shirt, sin_info: AlertTriangle }

export function Lavanderia() {
  const [seleccion, setSeleccion] = useState<number[]>([])
  const [cargas, setCargas] = useState<Carga[] | null>(null)
  const [cargando, setCargando] = useState(false)

  async function calcular() {
    setCargando(true)
    try {
      setCargas((await armarCargas(seleccion)).cargas)
    } catch (err) {
      showToast(`No se pudo calcular: ${(err as Error).message}`, 'error')
    } finally {
      setCargando(false)
    }
  }

  if (cargas) {
    return (
      <>
        <PageHeader titulo="Tus cargas" subtitulo={`${seleccion.length} prendas en ${cargas.length} ${cargas.length === 1 ? 'grupo' : 'grupos'}`}>
          <button onClick={() => setCargas(null)} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Cambiar
          </button>
        </PageHeader>
        <div className="space-y-4 px-5">
          {cargas.map((c) => {
            const Icono = ICONO[c.tipo]
            return (
              <section key={c.nombre} className="space-y-3 rounded-3xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Icono className="h-5 w-5 text-accent" strokeWidth={1.8} />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg">{c.nombre}</h3>
                    <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                      {c.temperatura != null && (
                        <span className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /> máx. {c.temperatura} °C</span>
                      )}
                      {c.ciclo && <span>ciclo {c.ciclo}</span>}
                    </div>
                    {c.consejo && <p className="mt-1 text-sm text-muted-foreground">{c.consejo}</p>}
                    {c.tipo === 'sin_info' && (
                      <Link href="/lavanderia/guia?tab=telas" className="mt-1 inline-block text-sm text-accent underline-offset-4 hover:underline">
                        Ver cómo se lava cada tela
                      </Link>
                    )}
                  </div>
                </div>
                <ul className="space-y-2">
                  {c.prendas.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={urlMedia(p.foto)} alt="" className="h-full w-full object-contain" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium first-letter:uppercase">{p.subcategoria || p.categoria}</p>
                        {p.avisos.length > 0 && <p className="text-xs text-muted-foreground">{p.avisos.join(' · ')}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader titulo="Lavandería" subtitulo="Elige lo que vas a lavar y Stylo lo separa en cargas">
        <Link href="/lavanderia/guia" className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-sm">
          <BookOpen className="h-4 w-4" /> Guía
        </Link>
      </PageHeader>
      <div className="px-5">
        <PrendaPicker
          multiple
          seleccion={seleccion}
          onToggle={(p) => setSeleccion((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
        />
      </div>
      {seleccion.length > 0 && (
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto max-w-lg px-5">
          <button
            onClick={calcular} disabled={cargando}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-medium text-primary-foreground shadow-xl disabled:opacity-50"
          >
            {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <WashingMachine className="h-4 w-4" />}
            Separar {seleccion.length} {seleccion.length === 1 ? 'prenda' : 'prendas'}
          </button>
        </div>
      )}
    </>
  )
}
