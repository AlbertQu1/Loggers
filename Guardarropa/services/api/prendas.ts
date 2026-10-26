import type { Prenda } from '@/types'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8003'

export const urlMedia = (ruta: string | null) => (ruta ? `${API_BASE_URL}/media/${ruta}` : '')

export interface EtiquetasPrenda {
  categoria: string
  subcategoria: string | null
  colores: string[]
  estampado: string | null
  material: string | null
  formalidad: number | null
  temporada: string[]
  ocasiones: string[]
  descripcion: string
}

export interface Analisis {
  foto_original: string
  foto_recortada: string | null
  etiquetas: EtiquetasPrenda | null
}

export type PrendaIn = EtiquetasPrenda & { foto_original: string; foto_recortada: string | null }

async function json<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const detalle = await resp.json().catch(() => null)
    throw new Error(detalle?.detail || `Error ${resp.status}`)
  }
  return resp.json()
}

export async function analizarFoto(foto: File): Promise<Analisis> {
  const form = new FormData()
  form.append('foto', foto)
  return json(await fetch(`${API_BASE_URL}/prendas/analizar`, { method: 'POST', body: form }))
}

export async function crearPrenda(p: PrendaIn): Promise<{ id: number }> {
  return json(
    await fetch(`${API_BASE_URL}/prendas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    }),
  )
}

export async function listarPrendas(categoria?: string): Promise<Prenda[]> {
  const qs = categoria ? `?categoria=${encodeURIComponent(categoria)}` : ''
  return json(await fetch(`${API_BASE_URL}/prendas${qs}`, { cache: 'no-store' }))
}

export async function editarPrenda(id: number, p: PrendaIn): Promise<void> {
  await json(
    await fetch(`${API_BASE_URL}/prendas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    }),
  )
}

export async function bajaPrenda(id: number): Promise<void> {
  await json(await fetch(`${API_BASE_URL}/prendas/${id}`, { method: 'DELETE' }))
}
