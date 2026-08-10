'use client'

import { useEffect, useState } from 'react'
import { BookX, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { getJuegosFaltantes, JuegoFaltante } from '@/services/api/reglamentos'
import { showToast } from '@/components/common/toast-notifications'

function formatFecha(fecha: string | null) {
  if (!fecha) return 'sin partidas'
  return new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

function ListaFaltantes({ items }: { items: JuegoFaltante[] }) {
  return (
    <div className="flex flex-col divide-y">
      {items.map((item) => (
        <div key={item.juego} className="flex items-center justify-between gap-3 py-2">
          <span className="text-sm truncate">{item.juego}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {item.partidas} partida{item.partidas !== 1 ? 's' : ''} · {formatFecha(item.ultima_partida)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function BgStatsScreen() {
  const [faltantes, setFaltantes] = useState<JuegoFaltante[] | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarOtros, setMostrarOtros] = useState(false)

  useEffect(() => {
    getJuegosFaltantes()
      .then(setFaltantes)
      .catch((err) => showToast(err instanceof Error ? err.message : 'No se pudo cargar la lista', 'error'))
      .finally(() => setCargando(false))
  }, [])

  const propios = faltantes?.filter((j) => j.es_propio) || []
  const otros = faltantes?.filter((j) => !j.es_propio) || []

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5">
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2 mb-1">
          <BookX className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium">Manuales faltantes</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Juegos que tienes en tu biblioteca de BG Stats sin reglamento indexado, ordenados por veces jugados.
        </p>

        {cargando && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
          </div>
        )}

        {!cargando && propios.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">
            Ya tienes indexado el manual de todos los juegos que posees. 🎉
          </p>
        )}

        {!cargando && propios.length > 0 && <ListaFaltantes items={propios} />}
      </div>

      {!cargando && otros.length > 0 && (
        <div className="rounded-lg border bg-card p-3">
          <button
            type="button"
            onClick={() => setMostrarOtros((v) => !v)}
            className="flex items-center gap-2 w-full text-left"
          >
            {mostrarOtros ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <p className="text-sm font-medium">Otros juegos sin manual ({otros.length})</p>
          </button>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            No los tienes en tu biblioteca — el manual no es indispensable, pero puedes indexarlo si los juegas seguido.
          </p>
          {mostrarOtros && <ListaFaltantes items={otros} />}
        </div>
      )}
    </div>
  )
}
