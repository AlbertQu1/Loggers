import type { Categoria } from '@/types'

export const CATEGORIAS: { valor: Categoria; label: string }[] = [
  { valor: 'top', label: 'Tops' },
  { valor: 'bottom', label: 'Pantalones' },
  { valor: 'calzado', label: 'Zapatos' },
  { valor: 'chamarra', label: 'Chamarras' },
  { valor: 'accesorio', label: 'Accesorios' },
  { valor: 'vestido_completo', label: 'Completo' },
]

export const TEMPORADAS = ['calor', 'templado', 'frio']
export const OCASIONES = ['casa', 'casual', 'oficina', 'salir', 'formal', 'deporte']
