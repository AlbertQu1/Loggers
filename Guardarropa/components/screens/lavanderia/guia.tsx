'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Clock, Loader2, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { SimboloCuidado } from '@/components/common/simbolo-cuidado'
import { showToast } from '@/components/common/toast-notifications'
import { listarSimbolos, obtenerGuia } from '@/services/api/prendas'
import type { GuiaCuidado, Simbolo } from '@/types'

export type TabGuia = 'simbolos' | 'telas' | 'casa'
const TABS: { id: TabGuia; nombre: string }[] = [
  { id: 'simbolos', nombre: 'Símbolos' },
  { id: 'telas', nombre: 'Telas' },
  { id: 'casa', nombre: 'Casa' },
]

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function Guia({ tabInicial = 'simbolos' }: { tabInicial?: TabGuia }) {
  const [tab, setTab] = useState<TabGuia>(tabInicial)
  const [guia, setGuia] = useState<GuiaCuidado | null>(null)
  const [simbolos, setSimbolos] = useState<Simbolo[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([obtenerGuia(), listarSimbolos()])
      .then(([g, s]) => { setGuia(g); setSimbolos(s) })
      .catch((err) => showToast(`No se pudo cargar la guía: ${(err as Error).message}`, 'error'))
  }, [])

  const porCodigo = useMemo(() => Object.fromEntries(simbolos.map((s) => [s.codigo, s])), [simbolos])
  const q = norm(busqueda.trim())
  const coincide = (...textos: string[]) => !q || textos.some((t) => norm(t).includes(q))

  const fichas = tab === 'telas' ? guia?.telas ?? [] : guia?.hogar ?? []

  return (
    <>
      <PageHeader titulo="Guía de cuidado" subtitulo="Qué significa cada símbolo y cómo lavar cada cosa">
        <Link href="/lavanderia" className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Lavar
        </Link>
      </PageHeader>

      <div className="sticky top-0 z-20 space-y-3 bg-background/95 px-5 pb-3 pt-1 backdrop-blur">
        <div className="grid grid-cols-3 rounded-full bg-secondary p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setAbierto(null) }}
              className={`rounded-full py-2 text-sm transition ${tab === t.id ? 'bg-card font-medium shadow-sm' : 'text-muted-foreground'}`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-full border bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder={tab === 'simbolos' ? 'Buscar: secadora, 30, plancha…' : tab === 'telas' ? 'Buscar: lino, licra…' : 'Buscar: cortinas, toallas…'}
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {!guia && (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
      )}

      {guia && tab === 'simbolos' && (
        <div className="space-y-4 px-5">
          {guia.grupos.map((g) => {
            const lista = simbolos.filter((s) => s.grupo === g.grupo && coincide(s.descripcion, g.nombre))
            if (!lista.length) return null
            return (
              <section key={g.grupo} className="space-y-3 rounded-3xl border bg-card p-5">
                <div>
                  <h3 className="font-serif text-lg">{g.nombre}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.como_leer}</p>
                </div>
                <ul className="grid grid-cols-1 gap-2">
                  {lista.map((s) => (
                    <li key={s.codigo} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm">
                      <SimboloCuidado codigo={s.codigo} grupo={s.grupo} className="h-8 w-8 shrink-0" />
                      {s.descripcion}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {guia && tab !== 'simbolos' && (
        <div className="space-y-3 px-5">
          {tab === 'casa' && !q && (
            <p className="text-sm text-muted-foreground">
              Lo típico para cada cosa. Si trae etiqueta, lo que diga la etiqueta manda.
            </p>
          )}
          {fichas
            .filter((f) => coincide(f.nombre, 'descripcion' in f ? f.descripcion : '', ...f.consejos))
            .map((f) => {
              const open = abierto === f.id || !!q
              return (
                <section key={f.id} className="rounded-3xl border bg-card">
                  <button onClick={() => setAbierto(open && !q ? null : f.id)} className="flex w-full items-start gap-3 p-5 text-left">
                    <div className="flex-1">
                      <h3 className="font-serif text-lg">{f.nombre}</h3>
                      {'descripcion' in f && <p className="mt-0.5 text-sm text-muted-foreground">{f.descripcion}</p>}
                      {'frecuencia' in f && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> {f.frecuencia}
                        </p>
                      )}
                      <div className="mt-2 flex gap-1.5 text-accent">
                        {f.simbolos.map((c) => porCodigo[c] && (
                          <SimboloCuidado key={c} codigo={c} grupo={porCodigo[c].grupo} className="h-6 w-6" />
                        ))}
                      </div>
                    </div>
                    <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-muted-foreground transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="space-y-4 border-t px-5 pb-5 pt-4">
                      <ul className="space-y-2">
                        {f.simbolos.map((c) => porCodigo[c] && (
                          <li key={c} className="flex items-center gap-3 text-sm">
                            <SimboloCuidado codigo={c} grupo={porCodigo[c].grupo} className="h-6 w-6 shrink-0 text-accent" />
                            {porCodigo[c].descripcion}
                          </li>
                        ))}
                      </ul>
                      <ul className="list-disc space-y-1.5 pl-5 text-sm marker:text-accent">
                        {f.consejos.map((c) => <li key={c}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </section>
              )
            })}
        </div>
      )}
    </>
  )
}
