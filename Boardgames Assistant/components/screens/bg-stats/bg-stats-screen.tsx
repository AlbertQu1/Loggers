'use client'

import { useEffect, useState } from 'react'
import { BookX, ChevronDown, ChevronRight, Loader2, Users } from 'lucide-react'
import { getJuegosFaltantes, JuegoFaltante } from '@/services/api/reglamentos'
import { getCompaneros, Companero } from '@/services/api/bgstats'
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

function ListaCompaneros({ items }: { items: Companero[] }) {
  const maxPartidas = items[0]?.partidas || 1
  return (
    <div className="flex flex-col divide-y">
      {items.map((c) => {
        const winrate = c.partidas > 0 ? Math.round((c.victorias / c.partidas) * 100) : 0
        return (
          <div key={c.nombre} className="py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm truncate">{c.nombre}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {c.partidas} partidas · {winrate}% victorias
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (c.partidas / maxPartidas) * 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function BgStatsScreen() {
  const [companeros, setCompaneros] = useState<Companero[] | null>(null)
  const [cargandoCompaneros, setCargandoCompaneros] = useState(true)

  const [faltantes, setFaltantes] = useState<JuegoFaltante[] | null>(null)
  const [cargandoFaltantes, setCargandoFaltantes] = useState(true)
  const [mostrarManuales, setMostrarManuales] = useState(false)
  const [mostrarOtros, setMostrarOtros] = useState(false)

  useEffect(() => {
    getCompaneros()
      .then(setCompaneros)
      .catch((err) => showToast(err instanceof Error ? err.message : 'No se pudo cargar companeros', 'error'))
      .finally(() => setCargandoCompaneros(false))

    getJuegosFaltantes()
      .then(setFaltantes)
      .catch((err) => showToast(err instanceof Error ? err.message : 'No se pudo cargar la lista', 'error'))
      .finally(() => setCargandoFaltantes(false))
  }, [])

  const propios = faltantes?.filter((j) => j.es_propio) || []
  const otros = faltantes?.filter((j) => !j.es_propio) || []
  const totalFaltantes = propios.length + otros.length

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5">
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium">Compañeros de juego</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Con quién juegas más, ordenado por número de partidas.
        </p>

        {cargandoCompaneros && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
          </div>
        )}

        {!cargandoCompaneros && companeros && companeros.length > 0 && (
          <ListaCompaneros items={companeros} />
        )}
      </div>

      <div className="rounded-lg border bg-card p-3">
        <button
          type="button"
          onClick={() => setMostrarManuales((v) => !v)}
          className="flex items-center gap-2 w-full text-left"
        >
          {mostrarManuales ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <BookX className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-medium">
            Manuales faltantes {!cargandoFaltantes && `(${totalFaltantes})`}
          </p>
        </button>

        {mostrarManuales && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">
              Juegos que tienes en tu biblioteca de BG Stats sin reglamento indexado, ordenados por veces jugados.
            </p>

            {cargandoFaltantes && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            )}

            {!cargandoFaltantes && propios.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">
                Ya tienes indexado el manual de todos los juegos que posees. 🎉
              </p>
            )}

            {!cargandoFaltantes && propios.length > 0 && <ListaFaltantes items={propios} />}

            {!cargandoFaltantes && otros.length > 0 && (
              <div className="mt-3 pt-3 border-t">
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
                  No los tienes en tu biblioteca — el manual no es indispensable.
                </p>
                {mostrarOtros && <ListaFaltantes items={otros} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
