import type { Ajuste, Categoria, MotivoBaja } from '@/types'

export const CATEGORIAS: { valor: Categoria; label: string }[] = [
  { valor: 'top', label: 'Tops' },
  { valor: 'bottom', label: 'Pantalones' },
  { valor: 'calzado', label: 'Zapatos' },
  { valor: 'chamarra', label: 'Chamarras' },
  { valor: 'accesorio', label: 'Accesorios' },
  { valor: 'bolsa', label: 'Bolsas' },
  { valor: 'vestido_completo', label: 'Completo' },
]

export const TEMPORADAS = ['calor', 'templado', 'frio']
export const OCASIONES = ['casa', 'casual', 'oficina', 'salir', 'formal', 'deporte']


export const MOTIVOS_BAJA: { valor: MotivoBaja; label: string }[] = [
  { valor: 'regalada', label: 'Regalada' },
  { valor: 'donada', label: 'Donada' },
  { valor: 'vendida', label: 'Vendida' },
  { valor: 'rota', label: 'Rota o desgastada' },
  { valor: 'no_queda', label: 'Ya no me queda' },
  { valor: 'no_gusta', label: 'Ya no me gusta' },
  { valor: 'perdida', label: 'Se perdió' },
  { valor: 'otro', label: 'Otro' },
]

export const AJUSTES: { valor: Ajuste; label: string }[] = [
  { valor: 'ajustado', label: 'Ajustado' },
  { valor: 'regular', label: 'Regular' },
  { valor: 'holgado', label: 'Holgado' },
  { valor: 'oversize', label: 'Oversize' },
]
