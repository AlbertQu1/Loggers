// Nombre de color (como lo devuelve la IA) → muestra visual
const MAPA: Record<string, string> = {
  negro: '#111111', blanco: '#fafafa', gris: '#9ca3af', 'gris oscuro': '#4b5563', 'gris claro': '#d1d5db',
  azul: '#1e40af', 'azul marino': '#1e2a4a', marino: '#1e2a4a', 'azul claro': '#93c5fd', celeste: '#7dd3fc',
  rojo: '#b91c1c', vino: '#6b1d2a', guinda: '#6b1d2a', rosa: '#f9a8d4', morado: '#6d28d9', lila: '#c4b5fd',
  verde: '#15803d', 'verde olivo': '#5b6236', olivo: '#5b6236', 'verde militar': '#4b5320', menta: '#a7f3d0',
  amarillo: '#facc15', mostaza: '#c99a1a', naranja: '#ea580c', café: '#6b4423', cafe: '#6b4423', marrón: '#6b4423',
  beige: '#d9c7a7', crema: '#f1e7d0', arena: '#d6c4a0', camel: '#c19a6b', caqui: '#b5a77d', khaki: '#b5a77d',
  dorado: '#c9a227', plateado: '#c0c0c0', mezclilla: '#3b5b85', denim: '#3b5b85', turquesa: '#14b8a6',
}

export function colorCss(nombre: string): string {
  const n = nombre.toLowerCase().trim()
  return MAPA[n] ?? MAPA[n.split(' ')[0]] ?? '#bbb'
}
