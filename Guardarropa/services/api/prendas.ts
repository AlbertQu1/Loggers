import type { ArmadoOutfit, Carga, Cuidado, Fibra, Outfit, Prenda, Simbolo } from '@/types'

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

// ---------- Cuidado ----------

export interface PropuestaCuidado extends Cuidado {
  composicion: Fibra[]
}

export async function analizarEtiqueta(prendaId: number, foto: File): Promise<{ foto_etiqueta: string; cuidado: PropuestaCuidado | null }> {
  const form = new FormData()
  form.append('foto', foto)
  return json(await fetch(`${API_BASE_URL}/prendas/${prendaId}/etiqueta/analizar`, { method: 'POST', body: form }))
}

export async function guardarCuidado(
  prendaId: number,
  c: { foto_etiqueta?: string | null; simbolos: string[]; composicion: Fibra[]; notas: string },
): Promise<void> {
  await json(
    await fetch(`${API_BASE_URL}/prendas/${prendaId}/cuidado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    }),
  )
}

let cacheSimbolos: Simbolo[] | null = null
export async function listarSimbolos(): Promise<Simbolo[]> {
  if (!cacheSimbolos) cacheSimbolos = await json<Simbolo[]>(await fetch(`${API_BASE_URL}/cuidado/simbolos`))
  return cacheSimbolos
}

// ---------- Outfits ----------
export async function armarOutfit(base: number, fijas: number[] = []): Promise<ArmadoOutfit> {
  const qs = new URLSearchParams({ base: String(base) })
  fijas.forEach((f) => qs.append('fijas', String(f)))
  return json(await fetch(`${API_BASE_URL}/outfit/armar?${qs}`, { cache: 'no-store' }))
}

export async function registrarUso(prendas: number[], outfitId?: number): Promise<void> {
  await json(
    await fetch(`${API_BASE_URL}/usos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prendas, outfit_id: outfitId ?? null }),
    }),
  )
}

export async function deshacerUso(prendas: number[]): Promise<void> {
  const qs = new URLSearchParams()
  prendas.forEach((p) => qs.append('prendas', String(p)))
  await json(await fetch(`${API_BASE_URL}/usos?${qs}`, { method: 'DELETE' }))
}

export async function guardarOutfit(prendas: number[], nombre?: string): Promise<{ id: number }> {
  return json(
    await fetch(`${API_BASE_URL}/outfits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prendas, nombre: nombre || null, fuente: 'manual', aceptado: true }),
    }),
  )
}

export async function listarOutfits(): Promise<Outfit[]> {
  return json(await fetch(`${API_BASE_URL}/outfits`, { cache: 'no-store' }))
}

// ---------- Olvidadas y lavanderia ----------
export async function listarOlvidadas(): Promise<{ dias: number; sin_usar: Prenda[]; nunca_usadas: Prenda[] }> {
  return json(await fetch(`${API_BASE_URL}/prendas/olvidadas`, { cache: 'no-store' }))
}

export async function armarCargas(prendas: number[]): Promise<{ cargas: Carga[] }> {
  return json(
    await fetch(`${API_BASE_URL}/lavanderia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prendas }),
    }),
  )
}
