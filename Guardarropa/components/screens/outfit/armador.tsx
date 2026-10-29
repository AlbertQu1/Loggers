'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bookmark, CalendarCheck, Loader2, Pin, PinOff, RefreshCw } from 'lucide-react'
import { showToast } from '@/components/common/toast-notifications'
import { PageHeader } from '@/components/common/page-header'
import { PrendaPicker } from '@/components/common/prenda-picker'
import { armarOutfit, guardarOutfit, registrarUso, urlMedia } from '@/services/api/prendas'
import type { ArmadoOutfit, Categoria, Prenda } from '@/types'

const NOMBRE_SLOT: Record<Categoria, string> = {
  top: 'Arriba', bottom: 'Abajo', calzado: 'Zapatos', chamarra: 'Encima', accesorio: 'Accesorio', vestido_completo: 'Completo',
}
// Orden visual del look, de arriba a abajo
const ORDEN_LOOK: Categoria[] = ['chamarra', 'top', 'vestido_completo', 'bottom', 'calzado', 'accesorio']

function Foto({ p, className = '' }: { p: Prenda; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={urlMedia(p.foto_recortada ?? p.foto_original)} alt={p.subcategoria ?? ''} className={`object-contain ${className}`} />
}

export function Armador() {
  const router = useRouter()
  const params = useSearchParams()
  const baseId = Number(params.get('base')) || null

  const [armado, setArmado] = useState<ArmadoOutfit | null>(null)
  const [fijas, setFijas] = useState<number[]>([])
  const [seleccion, setSeleccion] = useState<Partial<Record<Categoria, number | null>>>({})
  const [cargando, setCargando] = useState(false)
  // Todas las prendas vistas: las fijadas ya no vienen en las opciones de la respuesta
  const vistas = useRef(new Map<number, Prenda>())
  // Slots que el usuario eligió a mano: se respetan al recalcular; los demás se re-sugieren
  const manuales = useRef(new Set<Categoria>())
  const [guardando, setGuardando] = useState<'' | 'uso' | 'guardar'>('')

  const cargar = useCallback(async (base: number, fijasActuales: number[]) => {
    setCargando(true)
    try {
      const r = await armarOutfit(base, fijasActuales)
      vistas.current.set(r.base.id, r.base)
      r.slots.forEach((s) => s.opciones.forEach((o) => vistas.current.set(o.prenda.id, o.prenda)))
      setArmado(r)
      setSeleccion((prev) => {
        const nueva: Partial<Record<Categoria, number | null>> = {}
        for (const s of r.slots) {
          if (s.fija) nueva[s.slot] = s.fija
          else if (
            manuales.current.has(s.slot) &&
            (prev[s.slot] === null || s.opciones.some((o) => o.prenda.id === prev[s.slot]))
          )
            nueva[s.slot] = prev[s.slot]
          else nueva[s.slot] = s.opcional ? null : s.opciones[0]?.prenda.id ?? null
        }
        return nueva
      })
    } catch (err) {
      showToast(`No se pudo armar: ${(err as Error).message}`, 'error')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    setFijas([])
    setSeleccion({})
    manuales.current.clear()
    setArmado(null)
    if (baseId) cargar(baseId, [])
  }, [baseId, cargar])

  // ---------- Paso 1: elegir prenda base ----------
  if (!baseId) {
    return (
      <>
        <PageHeader titulo="Arma tu outfit" subtitulo="Elige la prenda con la que quieres empezar" />
        <div className="px-5">
          <PrendaPicker seleccion={[]} onToggle={(p) => router.push(`/outfit?base=${p.id}`)} />
        </div>
      </>
    )
  }

  if (!armado) {
    return (
      <div className="flex justify-center py-28">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Prenda elegida por slot (la fija, o la seleccionada entre las opciones)
  const porId = vistas.current
  const elegidas: Prenda[] = [armado.base]
  for (const s of armado.slots) {
    const id = seleccion[s.slot]
    if (id && porId.has(id)) elegidas.push(porId.get(id)!)
  }
  const look = [...elegidas].sort((a, b) => ORDEN_LOOK.indexOf(a.categoria) - ORDEN_LOOK.indexOf(b.categoria))
  const ids = elegidas.map((p) => p.id)

  function elegir(slot: Categoria, id: number | null) {
    manuales.current.add(slot)
    setSeleccion({ ...seleccion, [slot]: id })
  }

  function toggleFija(id: number) {
    const nuevas = fijas.includes(id) ? fijas.filter((f) => f !== id) : [...fijas, id]
    setFijas(nuevas)
    cargar(baseId!, nuevas)
  }

  async function meLoPuse() {
    setGuardando('uso')
    try {
      const { id } = await guardarOutfit(ids)
      await registrarUso(ids, id)
      showToast('¡Registrado! Hoy usas este outfit', 'success')
    } catch (err) {
      showToast(`No se pudo registrar: ${(err as Error).message}`, 'error')
    } finally {
      setGuardando('')
    }
  }

  async function guardar() {
    setGuardando('guardar')
    try {
      await guardarOutfit(ids)
      showToast('Outfit guardado', 'success')
    } catch (err) {
      showToast(`No se pudo guardar: ${(err as Error).message}`, 'error')
    } finally {
      setGuardando('')
    }
  }

  return (
    <>
      <PageHeader titulo="Tu look" subtitulo="Desliza para cambiar · fija lo que te guste">
        <Link href="/outfit" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-3 py-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Otra base
        </Link>
      </PageHeader>

      {/* Vista previa del look */}
      <div className="mx-5 mb-6 rounded-3xl bg-secondary p-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {look.map((p) => (
            <div key={p.id} className={`flex w-[46%] items-center justify-center ${p.categoria === 'accesorio' ? 'h-20' : 'h-36'}`}>
              <Foto p={p} className="h-full w-full drop-shadow-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Prenda base */}
      <div className="mx-5 mb-5 flex items-center gap-3 rounded-2xl border bg-card p-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary p-1">
          <Foto p={armado.base} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Base</p>
          <p className="truncate font-medium first-letter:uppercase">{armado.base.subcategoria || armado.base.categoria}</p>
        </div>
      </div>

      {/* Slots */}
      <div className={`space-y-6 transition-opacity ${cargando ? 'opacity-50' : ''}`}>
        {armado.slots.map((s) => {
          const fija = s.fija ? porId.get(s.fija) : null
          const elegidaId = seleccion[s.slot] ?? null
          const elegida = s.opciones.find((o) => o.prenda.id === elegidaId)
          return (
            <section key={s.slot}>
              <div className="mb-2 flex items-center justify-between px-5">
                <h3 className="font-serif text-lg">
                  {NOMBRE_SLOT[s.slot]}
                  {s.opcional && <span className="ml-2 font-sans text-xs text-muted-foreground">opcional</span>}
                </h3>
                {(fija || elegidaId) && (
                  <button
                    onClick={() => toggleFija(fija ? fija.id : elegidaId!)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                      fija ? 'bg-accent text-accent-foreground' : 'border bg-card text-muted-foreground'
                    }`}
                  >
                    {fija ? <><PinOff className="h-3.5 w-3.5" /> Fijada</> : <><Pin className="h-3.5 w-3.5" /> Fijar</>}
                  </button>
                )}
              </div>

              {fija ? (
                <div className="mx-5 flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-accent bg-card p-3">
                  <Foto p={fija} className="h-full w-full" />
                </div>
              ) : s.opciones.length === 0 ? (
                <p className="mx-5 rounded-2xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                  Aún no tienes prendas de este tipo.{' '}
                  <Link href="/agregar" className="text-foreground underline underline-offset-4">Agregar</Link>
                </p>
              ) : (
                <>
                  <div className="scrollbar-none flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 py-1">
                    {s.opcional && (
                      <button
                        onClick={() => elegir(s.slot, null)}
                        className={`flex h-32 w-24 shrink-0 snap-start items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground ${
                          elegidaId === null ? 'border-primary ring-2 ring-primary' : ''
                        }`}
                      >
                        Sin
                      </button>
                    )}
                    {s.opciones.map((o) => (
                      <button
                        key={o.prenda.id}
                        onClick={() => elegir(s.slot, o.prenda.id)}
                        className={`flex h-32 w-32 shrink-0 snap-start items-center justify-center rounded-2xl border bg-card p-3 transition active:scale-[0.97] ${
                          elegidaId === o.prenda.id ? 'border-primary ring-2 ring-primary' : ''
                        }`}
                      >
                        <Foto p={o.prenda} className="h-full w-full" />
                      </button>
                    ))}
                  </div>
                  {elegida && (
                    <p className="mt-2 px-5 text-xs text-muted-foreground">
                      <span className="font-medium first-letter:uppercase text-foreground">{elegida.prenda.subcategoria}</span>
                      {elegida.razones.length > 0 && ` · ${elegida.razones.join(' · ')}`}
                    </p>
                  )}
                </>
              )}
            </section>
          )
        })}
      </div>

      {/* Acciones */}
      <div className="mx-5 mt-8 grid grid-cols-2 gap-3">
        <button
          onClick={guardar} disabled={!!guardando}
          className="flex items-center justify-center gap-2 rounded-full border bg-card py-4 text-sm font-medium disabled:opacity-50"
        >
          {guardando === 'guardar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />} Guardar
        </button>
        <button
          onClick={meLoPuse} disabled={!!guardando}
          className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {guardando === 'uso' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />} Me lo puse hoy
        </button>
      </div>
    </>
  )
}
