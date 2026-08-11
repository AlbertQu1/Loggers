const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface Companero {
  nombre: string
  partidas: number
  victorias: number
}

export async function getCompaneros(): Promise<Companero[]> {
  const response = await fetch(`${API_BASE_URL}/bgstats/companeros`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de companeros (${response.status})`)
  return response.json()
}
