import { BarChart3 } from 'lucide-react'

export function BgStatsScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-9rem)] px-8 text-center gap-3">
      <BarChart3 className="w-10 h-10 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Próximamente</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Aquí vas a poder ver estadísticas de tus partidas (BG Stats).
      </p>
    </div>
  )
}
