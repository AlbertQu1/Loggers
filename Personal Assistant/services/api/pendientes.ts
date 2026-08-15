import { ConfirmarPendienteParams } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8002'

export async function getPendientes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/pendientes`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de pendientes (${response.status})`)
  return response.json()
}

export function urlVerPendiente(archivoNombre: string): string {
  return `${API_BASE_URL}/pendientes/${encodeURIComponent(archivoNombre)}/archivo`
}

export async function descartarPendiente(archivoNombre: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/pendientes/${encodeURIComponent(archivoNombre)}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo descartar el archivo (${response.status})`)
  }
}

export interface ConfirmarPendienteResponse {
  nota?: string
  chunks_indexados?: number
  archivo_path?: string | null
}

export async function confirmarPendiente(params: ConfirmarPendienteParams): Promise<ConfirmarPendienteResponse> {
  const formData = new FormData()
  formData.append('archivo_nombre', params.archivoNombre)
  formData.append('doc_type', params.docType)
  if (params.comentario) formData.append('comentario', params.comentario)
  if (params.venue) formData.append('venue', params.venue)
  if (params.artista) formData.append('artista', params.artista)
  if (params.destino) formData.append('destino', params.destino)

  const response = await fetch(`${API_BASE_URL}/pendientes/confirmar`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo indexar el archivo (${response.status})`)
  }
  return response.json()
}
