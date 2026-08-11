'use client'

import { CalendarDays } from 'lucide-react'
import { CuandoJuegas } from '@/services/api/bgstats'

const ORDEN_DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const ABREV: Record<string, string> = {
  Lunes: 'Lun', Martes: 'Mar', Miercoles: 'Mie', Jueves: 'Jue',
  Viernes: 'Vie', Sabado: 'Sab', Domingo: 'Dom',
}

export function CuandoJuegasCard({ datos }: { datos: CuandoJuegas }) {
  const porDia = ORDEN_DIAS.map(
    (dia) => datos.por_dia_semana.find((d) => d.dia === dia) || { dia, partidas: 0 }
  )
  const maxDia = Math.max(...porDia.map((d) => d.partidas), 1)
  const maxMes = Math.max(...datos.por_mes.map((m) => m.partidas), 1)

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium">Cuándo juegas</p>
      </div>

      <p className="text-xs text-muted-foreground mb-2">Por día de la semana</p>
      <div className="flex items-end gap-1.5 h-24 mb-4">
        {porDia.map((d) => (
          <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end h-16">
              <div
                className="w-full rounded-t bg-primary"
                style={{ height: `${Math.max(4, (d.partidas / maxDia) * 100)}%` }}
                title={`${d.partidas} partidas`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{ABREV[d.dia]}</span>
          </div>
        ))}
      </div>

      {datos.por_mes.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground mb-2">Últimos 12 meses</p>
          <div className="flex items-end gap-1 h-16">
            {datos.por_mes.map((m) => (
              <div key={m.mes} className="flex-1 flex flex-col items-center gap-1" title={`${m.mes}: ${m.partidas}`}>
                <div className="w-full flex items-end h-12">
                  <div
                    className="w-full rounded-t bg-primary/60"
                    style={{ height: `${Math.max(4, (m.partidas / maxMes) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{datos.por_mes[0]?.mes}</span>
            <span>{datos.por_mes[datos.por_mes.length - 1]?.mes}</span>
          </div>
        </>
      )}
    </div>
  )
}
