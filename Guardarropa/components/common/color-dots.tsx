import { colorCss } from '@/lib/colores'

export function ColorDots({ colores, max = 4 }: { colores: string[]; max?: number }) {
  return (
    <span className="flex -space-x-1">
      {colores.slice(0, max).map((c) => (
        <span key={c} title={c} className="h-3 w-3 rounded-full outline outline-1 outline-foreground/25 ring-2 ring-card" style={{ backgroundColor: colorCss(c) }} />
      ))}
    </span>
  )
}
