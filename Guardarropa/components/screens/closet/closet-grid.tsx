'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Archive, Camera, Loader2, Sparkles, Trash2, WashingMachine, X } from 'lucide-react'
import { showToast } from '@/components/common/toast-notifications'
import { PageHeader } from '@/components/common/page-header'
import { ColorDots } from '@/components/common/color-dots'
import { EtiquetasForm } from '@/components/screens/agregar/etiquetas-form'
import { CuidadoSection } from '@/components/screens/closet/cuidado-section'
import { formatoTalla } from '@/components/common/talla-input'
import { CATEGORIAS, MOTIVOS_BAJA } from '@/lib/categorias'
import { bajaPrenda, editarPrenda, listarPrendas, urlMedia, type EtiquetasPrenda } from '@/services/api/prendas'
import type { MotivoBaja, Prenda } from '@/types'

function diasDesde(fecha: string | null) {
  if (!fecha) return null
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000)
}

export function ClosetGrid() {
  const [categoria, setCategoria] = useState<string>('')
  const [prendas, setPrendas] = useState<Prenda[] | null>(null)
  const [abierta, setAbierta] = useState<Prenda | null>(null)
  const abiertaRef = useRef<Prenda | null>(null)
  abiertaRef.current = abierta
  const [edicion, setEdicion] = useState<EtiquetasPrenda | null>(null)
  // Sacar del clóset: null = cerrado
  const [baja, setBaja] = useState<{ motivo: MotivoBaja | null; nota: string; enviando: boolean } | null>(null)

  async function cargar() {
    try {
      const lista = await listarPrendas(categoria || undefined)
      setPrendas(lista)
      // refresca la prenda abierta (ej. después de guardar su cuidado)
      setAbierta((a) => (a ? lista.find((p) => p.id === a.id) ?? null : a))
      // la etiqueta pudo llenar marca/talla: que "Guardar cambios" no las borre
      setEdicion((e) => {
        const p = e && abiertaRef.current ? lista.find((x) => x.id === abiertaRef.current!.id) : null
        return e && p ? { ...e, marca: e.marca || p.marca, talla: e.talla || p.talla } : e
      })
    } catch (err) {
      showToast(`No se pudo cargar el clóset: ${(err as Error).message}`, 'error')
      setPrendas([])
    }
  }

  useEffect(() => {
    setPrendas(null)
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria])

  function abrir(p: Prenda) {
    setAbierta(p)
    setEdicion({
      categoria: p.categoria, subcategoria: p.subcategoria, colores: p.colores, estampado: p.estampado,
      material: p.material, formalidad: p.formalidad, temporada: p.temporada, ocasiones: p.ocasiones,
      descripcion: p.descripcion ?? '', talla: p.talla, marca: p.marca, ajuste: p.ajuste,
    })
  }

  async function guardar() {
    if (!abierta || !edicion) return
    try {
      await editarPrenda(abierta.id, { ...edicion, foto_original: abierta.foto_original, foto_recortada: abierta.foto_recortada })
      showToast('Cambios guardados', 'success')
      setAbierta(null)
      cargar()
    } catch (err) {
      showToast(`No se pudo guardar: ${(err as Error).message}`, 'error')
    }
  }

  async function sacar() {
    if (!abierta || !baja?.motivo) return
    setBaja({ ...baja, enviando: true })
    try {
      await bajaPrenda(abierta.id, baja.motivo, baja.nota)
      showToast('Salió del clóset. La encuentras en Salidas', 'success')
      setBaja(null)
      setAbierta(null)
      cargar()
    } catch (err) {
      showToast(`No se pudo sacar: ${(err as Error).message}`, 'error')
      setBaja({ ...baja, enviando: false })
    }
  }

  const subtitulo = prendas === null ? ' ' : `${prendas.length} ${prendas.length === 1 ? 'prenda' : 'prendas'}`

  return (
    <>
      <PageHeader titulo="Mi clóset" subtitulo={subtitulo}>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/lavanderia"
            className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-sm"
            aria-label="Lavandería"
          >
            <WashingMachine className="h-4 w-4" /> Lavar
          </Link>
          <Link
            href="/salidas"
            className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-sm"
          >
            <Archive className="h-4 w-4" /> Salidas
          </Link>
        </div>
      </PageHeader>

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-5">
        {[{ valor: '', label: 'Todo' }, ...CATEGORIAS].map((c) => (
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

      {prendas === null && (
        <div className="grid grid-cols-2 gap-3 px-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      )}

      {prendas?.length === 0 && (
        <div className="mx-5 flex flex-col items-center gap-4 rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
          <p className="font-serif text-xl">{categoria ? 'Nada por aquí todavía' : 'Tu clóset está vacío'}</p>
          <p className="max-w-64 text-sm text-muted-foreground">
            Toma fotos de tu ropa y Stylo empezará a armar outfits contigo.
          </p>
          <Link href="/agregar" className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            <Camera className="h-4 w-4" /> Agregar primera prenda
          </Link>
        </div>
      )}

      {prendas && prendas.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-5">
          {prendas.map((p) => {
            const dias = diasDesde(p.ultimo_uso)
            return (
              <button key={p.id} onClick={() => abrir(p)} className="group overflow-hidden rounded-2xl border bg-card text-left transition active:scale-[0.98]">
                <div className="relative flex aspect-square items-center justify-center bg-secondary p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlMedia(p.foto_recortada ?? p.foto_original)} alt={p.subcategoria ?? ''} className="h-full w-full object-contain drop-shadow-md" loading="lazy" />
                  {dias !== null && dias >= 60 && (
                    <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                      {dias} días sin usar
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="truncate text-sm font-medium first-letter:uppercase">{p.subcategoria || p.categoria}</span>
                  <ColorDots colores={p.colores} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {abierta && edicion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-background/90 px-5 py-4 backdrop-blur-md pt-[max(1rem,env(safe-area-inset-top))]">
            <span className="font-serif text-xl first-letter:uppercase">{abierta.subcategoria || 'Prenda'}</span>
            <button onClick={() => { setAbierta(null); setBaja(null) }} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mx-auto max-w-lg space-y-6 px-5 pb-16">
            <div className="flex justify-center rounded-3xl bg-secondary p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlMedia(abierta.foto_recortada ?? abierta.foto_original)} alt="" className="max-h-64 object-contain drop-shadow-xl" />
            </div>
            <div className="flex justify-around rounded-2xl border bg-card py-4 text-center">
              <div>
                <p className="font-serif text-2xl">{abierta.veces_usada}</p>
                <p className="text-xs text-muted-foreground">veces usada</p>
              </div>
              <div>
                <p className="font-serif text-2xl">{diasDesde(abierta.ultimo_uso) ?? '—'}</p>
                <p className="text-xs text-muted-foreground">días desde la última</p>
              </div>
            </div>
            {(abierta.talla || abierta.marca || abierta.ajuste) && (
              <div className="flex flex-wrap justify-center gap-2">
                {abierta.marca && <span className="rounded-full bg-secondary px-3 py-1 text-sm">{abierta.marca}</span>}
                {abierta.talla && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm">
                    {abierta.talla.includes('/') ? formatoTalla(abierta.categoria, abierta.talla) : `Talla ${abierta.talla}`}
                  </span>
                )}
                {abierta.ajuste && <span className="rounded-full bg-secondary px-3 py-1 text-sm first-letter:uppercase">{abierta.ajuste}</span>}
              </div>
            )}
            <Link
              href={`/outfit?base=${abierta.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-medium text-primary-foreground active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" /> Armar outfit con esta
            </Link>
            <CuidadoSection prenda={abierta} onGuardado={cargar} />
            <h3 className="pt-2 font-serif text-xl">Detalles</h3>
            <EtiquetasForm valor={edicion} onChange={setEdicion} />
            <button onClick={guardar} className="w-full rounded-full border bg-card py-4 text-[15px] font-medium active:scale-[0.98]">
              Guardar cambios
            </button>
            {!baja ? (
              <button
                onClick={() => setBaja({ motivo: null, nota: '', enviando: false })}
                className="flex w-full items-center justify-center gap-2 py-3 text-sm text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Sacar del clóset
              </button>
            ) : (
              <section className="space-y-4 rounded-3xl border bg-card p-5">
                <div>
                  <h3 className="font-serif text-xl">¿Por qué sale?</h3>
                  <p className="text-sm text-muted-foreground">Deja de aparecer en el clóset y en los outfits; su historial se queda en Salidas.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOTIVOS_BAJA.map((m) => (
                    <button
                      key={m.valor}
                      onClick={() => setBaja({ ...baja, motivo: m.valor })}
                      className={`rounded-full border px-3.5 py-2 text-sm transition ${
                        baja.motivo === m.valor ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <input
                  value={baja.nota} onChange={(e) => setBaja({ ...baja, nota: e.target.value })}
                  placeholder={baja.motivo === 'regalada' ? '¿A quién? (opcional)' : 'Nota (opcional)'}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
                <div className="flex gap-2">
                  <button onClick={() => setBaja(null)} className="flex-1 rounded-full border py-3 text-sm">Cancelar</button>
                  <button
                    onClick={sacar} disabled={!baja.motivo || baja.enviando}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-destructive py-3 text-sm font-medium text-white disabled:opacity-40"
                  >
                    {baja.enviando && <Loader2 className="h-4 w-4 animate-spin" />} Sacar
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </>
  )
}
