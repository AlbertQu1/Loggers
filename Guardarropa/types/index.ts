export interface HealthStatus {
  status: 'connected' | 'offline'
  timestamp: string
}

export type Categoria = 'top' | 'bottom' | 'calzado' | 'chamarra' | 'accesorio' | 'vestido_completo'

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
  ultimo_uso: string | null
  veces_usada: number
}
