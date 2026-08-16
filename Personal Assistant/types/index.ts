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

export interface PersonaPendiente {
  id: number
  nombre_mencionado: string
  nota_source: string
  candidato_nombre: string | null
  candidato_origen: string | null
  candidato_grupo_social: string | null
  similitud: number | null
}

export interface Persona {
  id: number
  nombre_canonico: string
  alias: string[]
  relacion: string | null
  ciudad_origen: string | null
  grupo_social: string | null
  fecha_nacimiento: string | null
  notas: string | null
}

export interface PersonaInput {
  nombre_canonico: string
  relacion?: string
  ciudad_origen?: string
  grupo_social?: string
  fecha_nacimiento?: string
  notas?: string
}

export interface PersonaUpdate {
  relacion?: string
  ciudad_origen?: string
  grupo_social?: string
  fecha_nacimiento?: string
  notas?: string
}

export interface Cumpleanos {
  id: number
  nombre_canonico: string
  relacion: string | null
  fecha_nacimiento: string
  proxima_fecha: string
  dias_restantes: number
  cumple_anos: number | null
}
