'use client'

import { useEffect, useState } from 'react'
import { Brain, ChevronDown, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import {
  getJuegosPredecibles,
  getEntrenamientoDuracion,
  getEntrenamientoDuracionSolo,
  predecirDuracion,
  predecirDuracionSolo,
  JuegoPredecible,
  EntrenamientoDuracion,
  PrediccionDuracion,
  PrediccionDuracionSolo,
} from '@/services/api/bgstats'
import { showToast } from '@/components/common/toast-notifications'

const ETIQUETA_FEATURE: Record<string, string> = {
  peso_complejidad: 'Complejidad (BGG)',
  dependencia_idioma: 'Dependencia de idioma',
  calificacion_promedio: 'Calificación BGG',
  temp_media_c: 'Temperatura',
  num_jugadores: 'Núm. jugadores',
  min_playtime: 'Duración mín. (BGG)',
  max_playtime: 'Duración máx. (BGG)',
  tag_digital: 'Digital',
  usa_expansion: 'Usa expansión',
  lugar_casa_propia: 'Lugar: casa',
  lugar_cafe: 'Lugar: café',
  lugar_fuera: 'Lugar: fuera/viaje',
  lugar_evento: 'Lugar: evento',
  lugar_amigos: 'Lugar: amigos',
  lugar_expareja: 'Lugar: expareja',
  lugar_pareja: 'Lugar: pareja',
  tag_solo: 'Modo solitario',
  min_jugadores: 'Mín. jugadores (BGG)',
  max_jugadores: 'Máx. jugadores (BGG)',
}

const CATEGORIAS_LUGAR = [
  { value: '', label: 'Sin especificar' },
  { value: 'casa_propia', label: 'Casa' },
  { value: 'cafe', label: 'Café' },
  { value: 'fuera', label: 'Fuera / viaje' },
  { value: 'evento', label: 'Evento' },
  { value: 'amigos', label: 'Amigos' },
  { value: 'expareja', label: 'Expareja' },
  { value: 'pareja', label: 'Pareja' },
]

const CATEGORIAS_GRUPO = [
  { value: '', label: 'Sin especificar' },
  { value: 'Reformers', label: 'Reformers' },
  { value: 'Pup', label: 'Pup' },
  { value: 'Cartoneros', label: 'Cartoneros' },
  { value: 'GEM', label: 'GEM' },
  { value: 'Entreturnos', label: 'Entreturnos' },
  { value: 'Cdmx', label: 'CDMX' },
  { value: 'Cul', label: 'Culiacán' },
  { value: 'Solo', label: 'Solo/bots' },
  { value: 'Otros', label: 'Otros' },
  { value: 'Extra', label: 'Extra' },
]

export function MlScreen() {
  const [juegos, setJuegos] = useState<JuegoPredecible[] | null>(null)
  const [entrenamiento, setEntrenamiento] = useState<EntrenamientoDuracion | null>(null)
  const [cargandoEntrenamiento, setCargandoEntrenamiento] = useState(true)
  const [modoSolo, setModoSolo] = useState(false)

  const [juego, setJuego] = useState('')
  const [numJugadores, setNumJugadores] = useState(4)
  const [lugarCategoria, setLugarCategoria] = useState('')
  const [grupoSocial, setGrupoSocial] = useState('')
  const [usaExpansion, setUsaExpansion] = useState(false)
  const [prediciendo, setPrediciendo] = useState(false)
  const [prediccion, setPrediccion] = useState<PrediccionDuracion | PrediccionDuracionSolo | null>(null)
  const [mostrarCoeficientes, setMostrarCoeficientes] = useState(false)

  useEffect(() => {
    getJuegosPredecibles()
      .then(setJuegos)
      .catch((err) => showToast(err instanceof Error ? err.message : 'No se pudo cargar la lista de juegos', 'error'))
  }, [])

  useEffect(() => {
    setCargandoEntrenamiento(true)
    setPrediccion(null)
    const cargar = modoSolo ? getEntrenamientoDuracionSolo : getEntrenamientoDuracion
    cargar()
      .then(setEntrenamiento)
      .catch((err) => showToast(err instanceof Error ? err.message : 'No se pudo entrenar el modelo', 'error'))
      .finally(() => setCargandoEntrenamiento(false))
  }, [modoSolo])

  const juegoSeleccionado = juegos?.find((j) => j.nombre === juego) || null
  const minJug = juegoSeleccionado?.min_jugadores || 1
  const maxJug = juegoSeleccionado?.max_jugadores || 10
  const opcionesJugadores = Array.from({ length: Math.max(1, maxJug - minJug + 1) }, (_, i) => minJug + i)

  useEffect(() => {
    if (juegoSeleccionado && (numJugadores < minJug || numJugadores > maxJug)) {
      setNumJugadores(minJug)
    }
  }, [juegoSeleccionado, minJug, maxJug, numJugadores])

  const handlePredecir = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!juego.trim()) {
      showToast('Elige un juego', 'warning')
      return
    }
    setPrediciendo(true)
    setPrediccion(null)
    try {
      const resultado = modoSolo
        ? await predecirDuracionSolo(juego.trim())
        : await predecirDuracion(
            juego.trim(),
            numJugadores,
            lugarCategoria || undefined,
            grupoSocial || undefined,
            usaExpansion
          )
      setPrediccion(resultado)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo predecir la duración', 'error')
    } finally {
      setPrediciendo(false)
    }
  }

  const coeficientesOrdenados = entrenamiento
    ? Object.entries(entrenamiento.coeficientes).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Predicción de duración</h1>
        </div>
        <div className="flex items-center rounded-lg border p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setModoSolo(false)}
            className={`px-2.5 py-1 rounded-md transition-colors ${!modoSolo ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => setModoSolo(true)}
            className={`px-2.5 py-1 rounded-md transition-colors ${modoSolo ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            Solo
          </button>
        </div>
      </div>

      <form onSubmit={handlePredecir} className="rounded-lg border bg-card p-3 space-y-3">
        <div>
          <label className="text-sm font-medium">Juego</label>
          <input
            list="juegos-predecibles"
            value={juego}
            onChange={(e) => setJuego(e.target.value)}
            placeholder={juegos ? `${juegos.length} juegos disponibles` : 'Cargando...'}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <datalist id="juegos-predecibles">
            {juegos?.map((j) => (
              <option key={j.nombre} value={j.nombre} />
            ))}
          </datalist>
        </div>

        {modoSolo && (
          <p className="text-xs text-muted-foreground">
            Modo solitario: sin jugadores/lugar/grupo, el modelo usa min/max jugadores del juego (BGG) para
            distinguir juegos solo puros de multijugador jugado con Automa.
          </p>
        )}

        {!modoSolo && (
        <div>
          <label className="text-sm font-medium">Número de jugadores</label>
          <select
            value={numJugadores}
            onChange={(e) => setNumJugadores(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {opcionesJugadores.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {juegoSeleccionado && (minJug !== 1 || maxJug !== 10) && (
            <p className="text-xs text-muted-foreground mt-1">
              Rango de BGG para este juego: {minJug}-{maxJug}
            </p>
          )}
        </div>
        )}

        {!modoSolo && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={usaExpansion}
            onChange={(e) => setUsaExpansion(e.target.checked)}
            className="rounded border"
          />
          Se va a usar expansión
        </label>
        )}

        {!modoSolo && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Lugar</label>
            <select
              value={lugarCategoria}
              onChange={(e) => setLugarCategoria(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIAS_LUGAR.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Grupo</label>
            <select
              value={grupoSocial}
              onChange={(e) => setGrupoSocial(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIAS_GRUPO.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        )}

        <button
          type="submit"
          disabled={prediciendo}
          className="w-full rounded-lg border px-3 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {prediciendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Predecir duración
        </button>
      </form>

      {prediccion && (
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">
            {prediccion.juego}
            {'num_jugadores' in prediccion ? ` · ${prediccion.num_jugadores} jugadores` : ' · solo'}
          </p>
          <p className="text-3xl font-semibold mt-1">{prediccion.duracion_estimada_min} min</p>
          <p className="text-xs text-muted-foreground mt-1">± {prediccion.mae_modelo} min de margen de error típico</p>
        </div>
      )}

      <div className="rounded-lg border bg-card p-3">
        <p className="text-sm font-medium mb-2">Cómo va el modelo</p>
        {cargandoEntrenamiento && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Entrenando...
          </div>
        )}
        {entrenamiento && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Entrenado con {entrenamiento.n} partidas reales · gana {entrenamiento.ganador}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Error del modelo</span>
              <span className="font-medium">± {entrenamiento.mae_por_modelo[entrenamiento.ganador]} min</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Error de solo adivinar el promedio</span>
              <span className="font-medium">± {entrenamiento.mae_baseline} min</span>
            </div>
            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={() => setMostrarCoeficientes((v) => !v)}
                className="flex items-center gap-2 w-full text-left"
              >
                {mostrarCoeficientes ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <p className="text-xs text-muted-foreground">Qué tanto pesa cada dato</p>
              </button>
              {mostrarCoeficientes && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {coeficientesOrdenados.map(([feature, valor]) => (
                    <div key={feature} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{ETIQUETA_FEATURE[feature] || feature}</span>
                      <span className={valor >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {valor >= 0 ? '+' : ''}
                        {valor}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
