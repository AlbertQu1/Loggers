'use client'

import { Resumen } from '@/services/api/bgstats'

function formatFecha(fecha: string | null) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ResumenCards({ resumen }: { resumen: Resumen }) {
  const items = [
    { label: 'Partidas', valor: resumen.partidas.toLocaleString('es-MX') },
    { label: 'Juegos distintos', valor: resumen.juegos_distintos.toLocaleString('es-MX') },
    { label: 'Horas jugadas', valor: resumen.horas_totales.toLocaleString('es-MX') },
    { label: 'Juegos propios', valor: resumen.juegos_propios.toLocaleString('es-MX') },
  ]

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-md bg-muted/40 p-2.5">
            <p className="text-lg font-semibold">{item.valor}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Jugando desde {formatFecha(resumen.primera_partida)}
        {resumen.promedio_partidas_mes && ` · ~${resumen.promedio_partidas_mes} partidas/mes en promedio`}
      </p>
    </div>
  )
}
