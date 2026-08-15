export interface HealthStatus {
  status: 'connected' | 'offline'
  timestamp: string
}

export interface Fuente {
  titulo: string
  source_path: string
  doc_type: string
  chunk_index: number
  fecha: string
}

export interface AskResponse {
  respuesta: string
  fuentes: Fuente[]
}

export interface ChatTurn {
  id: string
  pregunta: string
  respuesta?: string
  fuentes?: Fuente[]
  loading: boolean
  error?: string
}

export const DOC_TYPES = ['trabajo', 'escuela', 'receta', 'manual', 'diario', 'concierto', 'viaje', 'otro'] as const
export type DocType = (typeof DOC_TYPES)[number]

export interface ConfirmarPendienteParams {
  archivoNombre: string
  docType: string
  comentario?: string
  venue?: string
  artista?: string
  destino?: string
}
