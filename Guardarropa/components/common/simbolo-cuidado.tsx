import type { Simbolo } from '@/types'

/** Dibujo simplificado del símbolo ISO según su grupo; tachado si es un "no_". */
export function SimboloCuidado({ codigo, grupo, className = 'h-7 w-7' }: { codigo: string; grupo: Simbolo['grupo']; className?: string }) {
  const tachado = codigo.startsWith('no_')
  const temp = codigo.match(/_(\d{2})/)?.[1]
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
      {grupo === 'lavado' && (
        <>
          <path d="M4 9l3 17h18l3-17" />
          <path d="M4 9c3 2 5 2 8 0s5-2 8 0 5 2 8 0" />
          {temp && <text x="16" y="22" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">{temp}</text>}
          {codigo === 'lavado_mano' && <path d="M12 21c0-3 2-4 4-4s3 1 3 3" />}
        </>
      )}
      {grupo === 'blanqueador' && <path d="M16 4L29 27H3z" />}
      {grupo === 'secadora' && (
        <>
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <circle cx="16" cy="16" r="8" fill={codigo === 'secadora_sin_calor' ? 'currentColor' : 'none'} />
        </>
      )}
      {grupo === 'secado' && (
        <>
          <rect x="4" y="4" width="24" height="24" rx="2" />
          {codigo === 'secar_plano' ? <path d="M9 16h14" /> : <path d="M12 9v14M20 9v14" />}
        </>
      )}
      {grupo === 'planchado' && <path d="M5 24h22c0-7-4-12-11-12H9l-1 4" />}
      {grupo === 'tintoreria' && (
        <>
          <circle cx="16" cy="16" r="11" />
          {codigo.endsWith('_p') && <text x="16" y="20" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none">P</text>}
          {codigo.endsWith('_f') && <text x="16" y="20" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none">F</text>}
          {codigo.endsWith('_a') && <text x="16" y="20" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none">A</text>}
          {codigo.endsWith('_w') && <text x="16" y="20" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none">W</text>}
        </>
      )}
      {tachado && <path d="M5 5l22 22M27 5L5 27" />}
    </svg>
  )
}
