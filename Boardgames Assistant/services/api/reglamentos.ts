const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface BggResultado {
  bgg_id: number
  /** Nombre a usar: el de tu biblioteca de BG Stats si el juego ya esta ahi, si no el de BGG. */
  nombre: string
  nombre_bgg: string
  anio: number | null
  es_expansion: boolean
  thumbnail: string | null
  num_calificaciones: number | null
  en_biblioteca: boolean
  ya_indexado: boolean
}

export async function bggBuscar(q: string, signal?: AbortSignal): Promise<BggResultado[]> {
  const response = await fetch(
    `${API_BASE_URL}/juegos/bgg-buscar?q=${encodeURIComponent(q)}&limite=8`,
    { signal },
  )
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo buscar en BGG (${response.status})`)
  }
  return response.json()
}

export interface SubirReglamentoParams {
  archivo: File
  juego: string
  idioma: string
  docType: string
  juegoBase?: string
}

export async function subirReglamento(params: SubirReglamentoParams): Promise<{ chunks: number }> {
  const formData = new FormData()
  formData.append('archivo', params.archivo)
  formData.append('juego', params.juego)
  formData.append('idioma', params.idioma)
  formData.append('doc_type', params.docType)
  if (params.juegoBase) formData.append('juego_base', params.juegoBase)

  const response = await fetch(`${API_BASE_URL}/reglamentos/subir`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo indexar el reglamento (${response.status})`)
  }
  return response.json()
}

export async function getPendientes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/reglamentos/pendientes`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de pendientes (${response.status})`)
  return response.json()
}

export function urlVerPendiente(archivoNombre: string): string {
  return `${API_BASE_URL}/reglamentos/pendientes/${encodeURIComponent(archivoNombre)}/archivo`
}

export async function descartarPendiente(archivoNombre: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reglamentos/pendientes/${encodeURIComponent(archivoNombre)}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo descartar el archivo (${response.status})`)
  }
}

export interface JuegoFaltante {
  juego: string
  es_propio: boolean
  partidas: number
  ultima_partida: string | null
}

export async function getJuegosFaltantes(): Promise<JuegoFaltante[]> {
  const response = await fetch(`${API_BASE_URL}/juegos/faltantes`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de manuales faltantes (${response.status})`)
  return response.json()
}

export interface ConfirmarReglamentoParams {
  archivoNombre: string
  juego: string
  idioma: string
  docType: string
  juegoBase?: string
}

export async function confirmarReglamento(params: ConfirmarReglamentoParams): Promise<{ chunks: number }> {
  const formData = new FormData()
  formData.append('archivo_nombre', params.archivoNombre)
  formData.append('juego', params.juego)
  formData.append('idioma', params.idioma)
  formData.append('doc_type', params.docType)
  if (params.juegoBase) formData.append('juego_base', params.juegoBase)

  const response = await fetch(`${API_BASE_URL}/reglamentos/confirmar`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo indexar el reglamento (${response.status})`)
  }
  return response.json()
}
