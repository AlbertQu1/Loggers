'use client'

import { useHealthCheck } from '@/hooks/use-health-check'

export function HealthIndicator() {
  const { health } = useHealthCheck(30000)
  const isConnected = health.status === 'connected'

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div
        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        title={`Backend: ${isConnected ? 'Conectado' : 'Sin conexion'}`}
      />
      <span className="text-xs font-medium text-muted-foreground">
        {isConnected ? 'Conectado' : 'Sin conexion'}
      </span>
    </div>
  )
}
