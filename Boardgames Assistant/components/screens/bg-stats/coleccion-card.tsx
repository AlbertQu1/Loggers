'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Wallet } from 'lucide-react'
import { getColeccion, getPropiosSinJugar, Coleccion, JuegoSinJugar } from '@/services/api/bgstats'
import { showToast } from '@/components/common/toast-notifications'

const ETIQUETA_CATEGORIA: Record<string, string> = {
  tienda_fisica: '🏬 Tienda física',
  en_linea: '💻 En línea',
  regalo: '🎁 Regalo',
  viaje: '✈️ Viaje',
  amigos: '🤝 Amigos',
  sin_categoria: '📦 Otros',
}

function money(v: number) {
  return v.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
}

function duracionStr(min: number | null, max: number | null) {
  if (!min && !max) return null
  if (min && max && min !== max) return `${min}-${max} min`
  return `${min || max} min`
}

function jugadoresStr(min: number | null, max: number | null) {
  if (!min && !max) return null
  if (min && max && min !== max) return `${min}-${max} jug.`
  return `${min || max} jug.`
}

export function ColeccionCard() {
  const [datos, setDatos] = useState<Coleccion | null>(null)
  const [mostrarSinJugar, setMostrarSinJugar] = useState(false)
  const [sinJugar, setSinJugar] = useState<JuegoSinJugar[] | null>(null)
  const [cargandoSinJugar, setCargandoSinJugar] = useState(false)

  useEffect(() => {
    getColeccion()
      .then(setDatos)
      .catch((err) => showToast(err instanceof Error ? err.message : 'No se pudo cargar la colección', 'error'))
  }, [])

  const toggleSinJugar = () => {
    const abriendo = !mostrarSinJugar
    setMostrarSinJugar(abriendo)
    if (abriendo && sinJugar === null) {
      setCargandoSinJugar(true)
      getPropiosSinJugar()
        .then(setSinJugar)
        .catch((err) =>
          showToast(err instanceof Error ? err.message : 'No se pudo cargar la lista', 'error')
        )
        .finally(() => setCargandoSinJugar(false))
    }
  }

  if (!datos) return null

  const maxCategoria = Math.max(...datos.por_categoria.map((c) => c.gasto_mxn), 1)
  const maxFuente = Math.max(...datos.top_fuentes.map((f) => f.gasto_mxn), 1)

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium">Colección y gasto</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-md bg-muted/40 p-2.5">
          <p className="text-lg font-semibold">{money(datos.gasto_total_mxn)}</p>
          <p className="text-xs text-muted-foreground">Gasto total</p>
        </div>
        <div className="rounded-md bg-muted/40 p-2.5">
          <p className="text-lg font-semibold">{datos.copias_propias}</p>
          <p className="text-xs text-muted-foreground">Copias que tienes</p>
        </div>
        <button
          type="button"
          onClick={toggleSinJugar}
          className="rounded-md bg-muted/40 p-2.5 text-left hover:bg-muted/70 transition-colors"
        >
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold">{datos.juegos_propios_sin_jugar}</p>
            {mostrarSinJugar ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">Propios sin jugar</p>
        </button>
        <div className="rounded-md bg-muted/40 p-2.5">
          <p className="text-lg font-semibold">{datos.copias_ya_no_tiene}</p>
          <p className="text-xs text-muted-foreground">Ya no tienes</p>
        </div>
      </div>

      {mostrarSinJugar && (
        <div className="mb-4 rounded-md border p-2.5">
          {cargandoSinJugar && <p className="text-xs text-muted-foreground py-1">Cargando...</p>}
          {!cargandoSinJugar && sinJugar && sinJugar.length === 0 && (
            <p className="text-xs text-muted-foreground py-1">Ya jugaste todos tus juegos propios. 🎉</p>
          )}
          {!cargandoSinJugar && sinJugar && sinJugar.length > 0 && (
            <div className="flex flex-col divide-y">
              {sinJugar.map((j) => {
                const detalle = [jugadoresStr(j.min_jugadores, j.max_jugadores), duracionStr(j.min_duracion_min, j.max_duracion_min)]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <div key={j.nombre} className="py-1.5">
                    <p className="text-sm truncate">{j.nombre}</p>
                    {detalle && <p className="text-xs text-muted-foreground">{detalle}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-2">Gasto por tipo de compra</p>
      <div className="flex flex-col gap-2 mb-4">
        {datos.por_categoria.map((c) => (
          <div key={c.categoria} className="flex items-center gap-2">
            <span className="text-xs w-32 shrink-0">{ETIQUETA_CATEGORIA[c.categoria] || c.categoria}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (c.gasto_mxn / maxCategoria) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">{money(c.gasto_mxn)}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-2">Top lugares de compra</p>
      <div className="flex flex-col divide-y">
        {datos.top_fuentes.map((f) => (
          <div key={f.fuente} className="py-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm truncate">{f.fuente}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {f.juegos} juegos · {money(f.gasto_mxn)}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${Math.max(4, (f.gasto_mxn / maxFuente) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
