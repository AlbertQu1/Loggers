'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Library } from 'lucide-react'
import { getBiblioteca, Biblioteca } from '@/services/api/bgstats'
import { showToast } from '@/components/common/toast-notifications'

// mismos cortes que usa el endpoint (ver bgstats_biblioteca en api.py)
const ETIQUETA_PESO: Record<string, string> = {
  'muy ligero': '🪶 Muy ligero',
  ligero: '🎲 Ligero',
  medio: '🎯 Medio',
  'medio-pesado': '🧠 Medio-pesado',
  pesado: '🏔️ Pesado',
}

function pct(v: number | null) {
  return v === null ? '—' : `${v}%`
}

export function BibliotecaCard() {
  const [datos, setDatos] = useState<Biblioteca | null>(null)
  const [seccion, setSeccion] = useState<'peso' | 'modo' | 'mecanicas'>('peso')
  const [abierto, setAbierto] = useState(true)
  // contar partidas sobre-representa los fillers (un juego de 7 min pesa
  // igual que uno de 5 horas); por tiempo el perfil se ve muy distinto
  const [metrica, setMetrica] = useState<'partidas' | 'tiempo'>('tiempo')

  useEffect(() => {
    getBiblioteca()
      .then(setDatos)
      .catch((err) =>
        showToast(err instanceof Error ? err.message : 'No se pudo cargar la biblioteca', 'error')
      )
  }, [])

  if (!datos) return null

  const valor = (p: (typeof datos.por_peso)[number]) =>
    metrica === 'tiempo' ? p.minutos : p.partidas
  const maxValor = Math.max(...datos.por_peso.map(valor), 1)
  const totalValor = datos.por_peso.reduce((acc, p) => acc + valor(p), 0) || 1
  const maxMecanica = Math.max(...datos.mecanicas.map((m) => m.partidas), 1)

  return (
    <div className="rounded-lg border bg-card p-3">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 w-full text-left mb-3"
      >
        <Library className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-sm font-medium flex-1">Perfil de tu biblioteca</p>
        {abierto ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {abierto && (
        <>
          <div className="flex items-center rounded-lg border p-0.5 text-xs mb-3">
            {([
              ['peso', 'Por peso'],
              ['modo', 'Solo vs mesa'],
              ['mecanicas', 'Mecánicas'],
            ] as const).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setSeccion(valor)}
                className={`flex-1 px-2 py-1 rounded-md transition-colors ${
                  seccion === valor ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          {seccion === 'peso' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Medir por</p>
                <div className="flex items-center rounded-md border p-0.5 text-xs">
                  {([
                    ['tiempo', 'Horas'],
                    ['partidas', 'Partidas'],
                  ] as const).map(([v, etiq]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMetrica(v)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        metrica === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {etiq}
                    </button>
                  ))}
                </div>
              </div>

              {datos.por_peso.map((p) => (
                <div key={p.rango}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{ETIQUETA_PESO[p.rango] || p.rango}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {p.juegos} juegos ·{' '}
                      {metrica === 'tiempo'
                        ? `${Math.round(p.minutos / 60)} h`
                        : `${p.partidas} partidas`}{' '}
                      ({Math.round((valor(p) / totalValor) * 100)}%)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, (valor(p) / maxValor) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.duracion_prom_min ? `${p.duracion_prom_min} min prom.` : 'sin duración'} · ganas{' '}
                    {pct(p.pct_victoria)} · solo {Math.round(p.minutos_solo / 60)}h / mesa{' '}
                    {Math.round(p.minutos_multi / 60)}h
                  </p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Medido en partidas los ligeros parecen dominar; medido en horas el perfil cambia — un
                filler de 7 min cuenta igual que un pesado de 5 horas.
              </p>
            </div>
          )}

          {seccion === 'modo' && (
            <div className="flex flex-col divide-y">
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 pb-1.5 text-xs text-muted-foreground">
                <span>Juego</span>
                <span className="w-20 text-right">En mesa</span>
                <span className="w-20 text-right">Solitario</span>
              </div>
              {datos.solo_vs_multi.map((j) => (
                <div key={j.juego} className="grid grid-cols-[1fr_auto_auto] gap-2 py-1.5 items-center">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{j.juego}</p>
                    {j.peso !== null && (
                      <p className="text-xs text-muted-foreground">peso {j.peso.toFixed(1)}</p>
                    )}
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-sm">{pct(j.multi.pct_victoria)}</p>
                    <p className="text-xs text-muted-foreground">
                      {j.multi.partidas}p · {j.multi.duracion_min}m
                    </p>
                  </div>
                  <div className="w-20 text-right">
                    <p
                      className={`text-sm ${
                        j.solo.pct_victoria !== null &&
                        j.multi.pct_victoria !== null &&
                        j.solo.pct_victoria < j.multi.pct_victoria - 20
                          ? 'text-red-500'
                          : ''
                      }`}
                    >
                      {pct(j.solo.pct_victoria)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {j.solo.partidas}p · {j.solo.duracion_min}m
                    </p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-2">
                Solo juegos con 3+ partidas en ambos modos. En rojo, donde el modo solitario te cuesta
                mucho más que la mesa.
              </p>
            </div>
          )}

          {seccion === 'mecanicas' && (
            <div className="flex flex-col gap-2">
              {datos.mecanicas.map((m) => (
                <div key={m.mecanica} className="flex items-center gap-2">
                  <span className="text-xs w-36 shrink-0 truncate">{m.mecanica}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.max(4, (m.partidas / maxMecanica) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 w-24 text-right">
                    {m.partidas}p · {m.juegos}j
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Ponderado por partidas jugadas, no por juegos que tienes.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
