export interface HealthStatus {
  status: 'connected' | 'offline'
  timestamp: string
}

export interface Juego {
  juego: string
  juego_base: string | null
}

export interface Fuente {
  juego: string
  source_pdf: string
  idioma: string
  chunk_index: number
}

export interface AskResponse {
  respuesta: string
  fuentes: Fuente[]
}

export interface ChatTurn {
  id: string
  pregunta: string
  juego?: string
  respuesta?: string
  fuentes?: Fuente[]
  loading: boolean
  error?: string
}
