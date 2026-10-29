import type { Simbolo } from '@/types'

const Punto = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={1.6} fill="currentColor" stroke="none" />
const Texto = ({ children, y = 20, size = 11 }: { children: React.ReactNode; y?: number; size?: number }) => (
  <text x="16" y={y} fontSize={size} textAnchor="middle" fill="currentColor" stroke="none" fontFamily="inherit">{children}</text>
)

/** Dibujo del símbolo ISO 3758; tachado si es un "no_". */
export function SimboloCuidado({ codigo, grupo, className = 'h-7 w-7' }: { codigo: string; grupo: Simbolo['grupo']; className?: string }) {
  const tachado = codigo.startsWith('no_')
  const temp = codigo.match(/_(\d{2})/)?.[1]
  const rayas = codigo.endsWith('_muy_suave') ? 2 : codigo.endsWith('_suave') ? 1 : 0
  const nivel = /_(baja|alta|media|normal)$/.exec(codigo)?.[1]
  const puntos = { baja: 1, media: 2, normal: 2, alta: 3 }[nivel ?? ''] ?? 0

  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
      {grupo === 'lavado' && (
        <>
          <path d="M4 8l3 15h18l3-15" />
          <path d="M4 8c3 2 5 2 8 0s5-2 8 0 5 2 8 0" />
          {temp && <Texto y={20} size={8}>{temp}</Texto>}
          {codigo === 'lavado_mano' && <path d="M11 20v-5m2.5 5v-6m2.5 6v-6m2.5 6v-5m0 3l2.5-2" />}
          {rayas >= 1 && <path d="M7 26.5h18" />}
          {rayas >= 2 && <path d="M7 29.5h18" />}
        </>
      )}
      {grupo === 'blanqueador' && (
        <>
          <path d="M16 4L29 27H3z" />
          {codigo === 'blanqueador_sin_cloro' && <path d="M13 24l6-11M17 24l5-9" />}
        </>
      )}
      {grupo === 'secadora' && (
        <>
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <circle cx="16" cy="16" r="8" fill={codigo === 'secadora_sin_calor' ? 'currentColor' : 'none'} />
          {puntos === 1 && <Punto x={16} y={16} />}
          {puntos === 2 && <><Punto x={13} y={16} /><Punto x={19} y={16} /></>}
        </>
      )}
      {grupo === 'secado' && codigo !== 'no_exprimir' && (
        <>
          <rect x="4" y="4" width="24" height="24" rx="2" />
          {codigo === 'secar_colgado' && <path d="M8 4c3 6 13 6 16 0" />}
          {codigo === 'secar_escurriendo' && <path d="M11 9v14M16 9v14M21 9v14" />}
          {codigo === 'secar_plano' && <path d="M9 16h14" />}
          {codigo === 'secar_sombra' && <><path d="M4 11l7-7M4 16l12-12" /><path d="M10 20h12" /></>}
        </>
      )}
      {codigo === 'no_exprimir' && (
        <>
          <path d="M3 13c3 0 4 6 7 6s4-6 6-6 4 6 6 6 4-6 7-6" />
          <path d="M3 13v6M29 13v6" />
        </>
      )}
      {grupo === 'planchado' && (
        <>
          <path d="M5 24h22c0-7-4-12-11-12H9l-1 4" />
          {puntos >= 1 && puntos <= 3 && Array.from({ length: puntos }, (_, i) => (
            <Punto key={i} x={16 - (puntos - 1) * 2.5 + i * 5} y={19.5} />
          ))}
          {codigo === 'no_vapor' && <path d="M10 27v3M16 27v3M22 27v3" />}
        </>
      )}
      {grupo === 'tintoreria' && (
        <>
          <circle cx="16" cy="16" r="11" />
          {codigo.endsWith('_p') && <Texto>P</Texto>}
          {codigo.endsWith('_f') && <Texto>F</Texto>}
          {codigo.endsWith('_a') && <Texto>A</Texto>}
          {codigo.endsWith('_w') && <Texto>W</Texto>}
        </>
      )}
      {tachado && <path d="M5 5l22 22M27 5L5 27" />}
    </svg>
  )
}
