import type { LucideIcon } from 'lucide-react'

export function Proximamente({ icono: Icono, titulo, texto }: { icono: LucideIcon; titulo: string; texto: string }) {
  return (
    <div className="mx-5 flex flex-col items-center gap-4 rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Icono className="h-7 w-7 text-accent" strokeWidth={1.6} />
      </div>
      <div className="space-y-1">
        <p className="font-serif text-xl">{titulo}</p>
        <p className="text-sm text-muted-foreground">{texto}</p>
      </div>
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">Próximamente</span>
    </div>
  )
}
