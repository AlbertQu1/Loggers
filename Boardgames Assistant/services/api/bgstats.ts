const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface Companero {
  nombre: string
  partidas: number
  victorias: number
}

export type ModoCompaneros = 'jugadores' | 'todos'

export async function getCompaneros(modo: ModoCompaneros = 'jugadores'): Promise<Companero[]> {
  const response = await fetch(`${API_BASE_URL}/bgstats/companeros?modo=${modo}`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de companeros (${response.status})`)
  return response.json()
}

export interface Resumen {
  partidas: number
  juegos_distintos: number
  juegos_propios: number
  horas_totales: number
  primera_partida: string | null
  ultima_partida: string | null
  promedio_partidas_mes: number | null
}

export async function getResumen(): Promise<Resumen> {
  const response = await fetch(`${API_BASE_URL}/bgstats/resumen`)
  if (!response.ok) throw new Error(`No se pudo cargar el resumen (${response.status})`)
  return response.json()
}

export interface TopJuego {
  juego: string
  partidas: number
  horas: number
  digital: boolean
  bots: string | null
}

export type ModoTopJuegos = 'todos' | 'solo'

export async function getTopJuegos(modo: ModoTopJuegos = 'todos'): Promise<TopJuego[]> {
  const response = await fetch(`${API_BASE_URL}/bgstats/top-juegos?modo=${modo}`)
  if (!response.ok) throw new Error(`No se pudo cargar el top de juegos (${response.status})`)
  return response.json()
}

export interface CuandoJuegas {
  por_dia_semana: { dia: string; partidas: number }[]
  por_mes: { mes: string; partidas: number }[]
}

export async function getCuandoJuegas(): Promise<CuandoJuegas> {
  const response = await fetch(`${API_BASE_URL}/bgstats/cuando-juegas`)
  if (!response.ok) throw new Error(`No se pudo cargar la tendencia (${response.status})`)
  return response.json()
}

export interface Clima {
  partidas_con_clima: number
  lluvia: number
  sin_lluvia: number
  por_temperatura: { rango: string; partidas: number }[]
}

export async function getClima(): Promise<Clima> {
  const response = await fetch(`${API_BASE_URL}/bgstats/clima`)
  if (!response.ok) throw new Error(`No se pudo cargar el clima (${response.status})`)
  return response.json()
}

export interface TopLugar {
  lugar: string
  partidas: number
  lat: number | null
  lon: number | null
}

export async function getTopLugares(limite = 15): Promise<TopLugar[]> {
  const response = await fetch(`${API_BASE_URL}/bgstats/top-lugares?limite=${limite}`)
  if (!response.ok) throw new Error(`No se pudo cargar el top de lugares (${response.status})`)
  return response.json()
}

export interface Coleccion {
  gasto_total_mxn: number
  copias_propias: number
  copias_ya_no_tiene: number
  en_wishlist: number
  juegos_propios_total: number
  juegos_propios_sin_jugar: number
  por_categoria: { categoria: string; gasto_mxn: number; juegos: number }[]
  top_fuentes: { fuente: string; gasto_mxn: number; juegos: number }[]
}

export async function getColeccion(): Promise<Coleccion> {
  const response = await fetch(`${API_BASE_URL}/bgstats/coleccion`)
  if (!response.ok) throw new Error(`No se pudo cargar la colección (${response.status})`)
  return response.json()
}

export interface JuegoSinJugar {
  nombre: string
  min_jugadores: number | null
  max_jugadores: number | null
  min_duracion_min: number | null
  max_duracion_min: number | null
  rating: number | null
}

export async function getPropiosSinJugar(): Promise<JuegoSinJugar[]> {
  const response = await fetch(`${API_BASE_URL}/bgstats/propios-sin-jugar`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de juegos sin jugar (${response.status})`)
  return response.json()
}

export interface JuegoPredecible {
  nombre: string
  min_jugadores: number | null
  max_jugadores: number | null
}

export async function getJuegosPredecibles(): Promise<JuegoPredecible[]> {
  const response = await fetch(`${API_BASE_URL}/bgstats/duracion/juegos`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de juegos (${response.status})`)
  return response.json()
}

export interface EntrenamientoDuracion {
  n: number
  ganador: string
  mae_por_modelo: Record<string, number>
  mae_baseline: number
  coeficientes: Record<string, number>
}

export async function getEntrenamientoDuracion(): Promise<EntrenamientoDuracion> {
  const response = await fetch(`${API_BASE_URL}/bgstats/duracion/entrenamiento`)
  if (!response.ok) throw new Error(`No se pudo entrenar el modelo (${response.status})`)
  return response.json()
}

export interface PrediccionDuracion {
  juego: string
  num_jugadores: number
  lugar_categoria: string | null
  grupo_social: string | null
  duracion_estimada_min: number
  mae_modelo: number
}

export async function predecirDuracion(
  juego: string,
  numJugadores: number,
  lugarCategoria?: string,
  grupoSocial?: string,
  usaExpansion?: boolean
): Promise<PrediccionDuracion> {
  const params = new URLSearchParams({ juego, num_jugadores: String(numJugadores) })
  if (lugarCategoria) params.set('lugar_categoria', lugarCategoria)
  if (grupoSocial) params.set('grupo_social', grupoSocial)
  if (usaExpansion) params.set('usa_expansion', 'true')
  const response = await fetch(`${API_BASE_URL}/bgstats/duracion/predecir?${params}`)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo predecir la duración (${response.status})`)
  }
  return response.json()
}
