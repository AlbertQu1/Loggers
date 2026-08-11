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

export async function getTopLugares(): Promise<TopLugar[]> {
  const response = await fetch(`${API_BASE_URL}/bgstats/top-lugares`)
  if (!response.ok) throw new Error(`No se pudo cargar el top de lugares (${response.status})`)
  return response.json()
}
