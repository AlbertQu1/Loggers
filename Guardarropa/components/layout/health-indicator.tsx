'use client'

import { useHealthCheck } from '@/hooks/use-health-check'

export function HealthIndicator() {
  const { health } = useHealthCheck(30000)
  const ok = health.status === 'connected'
  return (
    <span
      className={`block h-2 w-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}
      title={ok ? 'Conectado' : 'Sin conexión con el servidor'}
    />
  )
}
