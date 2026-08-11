'use client'

import { CloudRain } from 'lucide-react'
import { Clima } from '@/services/api/bgstats'

const ETIQUETA_TEMP: Record<string, string> = {
  frio: '❄️ Frío (<15°C)',
  templado: '🌤️ Templado (15-22°C)',
  calido: '☀️ Cálido (>22°C)',
}

export function ClimaCard({ clima }: { clima: Clima }) {
  if (clima.partidas_con_clima === 0) return null

  const pctLluvia = Math.round((clima.lluvia / clima.partidas_con_clima) * 100)
  const maxTemp = Math.max(...clima.por_temperatura.map((t) => t.partidas), 1)
  const maxLluvia = Math.max(clima.lluvia, clima.sin_lluvia, 1)

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <CloudRain className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium">Clima</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {clima.partidas_con_clima.toLocaleString('es-MX')} partidas con clima histórico disponible
        · {pctLluvia}% con lluvia.
      </p>

      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs w-40 shrink-0">🌧️ Con lluvia</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(4, (clima.lluvia / maxLluvia) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0 w-10 text-right">{clima.lluvia}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-40 shrink-0">☁️ Sin lluvia</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${Math.max(4, (clima.sin_lluvia / maxLluvia) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0 w-10 text-right">{clima.sin_lluvia}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t">
        {clima.por_temperatura.map((t) => (
          <div key={t.rango} className="flex items-center gap-2">
            <span className="text-xs w-40 shrink-0">{ETIQUETA_TEMP[t.rango] || t.rango}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${Math.max(4, (t.partidas / maxTemp) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0 w-10 text-right">{t.partidas}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
