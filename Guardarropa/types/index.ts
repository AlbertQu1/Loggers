export interface HealthStatus {
  status: 'connected' | 'offline'
  timestamp: string
}

export type Categoria = 'top' | 'bottom' | 'calzado' | 'chamarra' | 'accesorio' | 'bolsa' | 'vestido_completo'

export interface Prenda {
  id: number
  foto_original: string
  foto_recortada: string | null
  categoria: Categoria
  subcategoria: string | null
  colores: string[]
  estampado: string | null
  material: string | null
  formalidad: number | null
  temporada: string[]
  ocasiones: string[]
  descripcion: string | null
  foto_etiqueta: string | null
  composicion: Fibra[] | null
  cuidado: Cuidado | null
  ultimo_uso: string | null
  veces_usada: number
}

export interface Fibra {
  fibra: string
  porcentaje: number | null
}

export interface Cuidado {
  simbolos?: string[]
  lavado?: 'maquina' | 'mano' | 'no_lavar' | null
  temperatura_max?: number | null
  blanqueador?: string | null
  secadora?: string | null
  secado?: string | null
  planchado?: string | null
  tintoreria?: string | null
  notas?: string
  origen?: OrigenCuidado | null
}

/** De dónde salieron los símbolos: la foto de la etiqueta, la tela elegida (estimado) o a mano. */
export type OrigenCuidado = 'etiqueta' | 'tela' | 'manual'

export interface GuiaCuidado {
  grupos: { grupo: Simbolo['grupo']; nombre: string; como_leer: string }[]
  telas: { id: string; nombre: string; descripcion: string; simbolos: string[]; consejos: string[] }[]
  hogar: { id: string; nombre: string; frecuencia: string; simbolos: string[]; consejos: string[] }[]
}

export interface EstimacionCuidado {
  simbolos: string[]
  telas: string[]
  no_reconocidas: string[]
}

export interface Simbolo {
  codigo: string
  grupo: 'lavado' | 'blanqueador' | 'secadora' | 'secado' | 'planchado' | 'tintoreria'
  descripcion: string
}

export interface OpcionSlot {
  prenda: Prenda
  score: number
  razones: string[]
}

export interface Slot {
  slot: Categoria
  opcional: boolean
  /** Solo aparece si se pide (bolsa/mochila) */
  a_pedido: boolean
  fija: number | null
  opciones: OpcionSlot[]
}

export interface ArmadoOutfit {
  base: Prenda
  slots: Slot[]
}

export interface Outfit {
  id: number
  nombre: string | null
  ocasion: string | null
  prendas: Prenda[]
  created_at: string
}

export interface Carga {
  nombre: string
  tipo: 'maquina' | 'mano' | 'tintoreria' | 'sin_info'
  temperatura: number | null
  ciclo: 'normal' | 'delicado' | null
  consejo: string
  prendas: { id: number; subcategoria: string | null; categoria: Categoria; foto: string; avisos: string[] }[]
}

export type MotivoBaja = 'regalada' | 'donada' | 'vendida' | 'rota' | 'no_queda' | 'no_gusta' | 'perdida' | 'otro'

export interface Baja {
  id: number
  foto_original: string
  foto_recortada: string | null
  categoria: Categoria
  subcategoria: string | null
  colores: string[]
  baja_motivo: MotivoBaja | null
  baja_nota: string | null
  baja_fecha: string | null
  created_at: string
  veces_usada: number
  ultimo_uso: string | null
}
