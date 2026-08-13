'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnonimoPendiente, getAnonimosPendientes, revisarAnonimoPendiente } from '@/services/api/bgstats'

export function useAnonimosPendientes(interval: number = 60000) {
  const [pendientes, setPendientes] = useState<AnonimoPendiente[]>([])

  const refrescar = useCallback(async () => {
    try {
      setPendientes(await getAnonimosPendientes())
    } catch {
      // silencioso -- si el backend esta caido ya lo muestra el HealthIndicator
    }
  }, [])

  useEffect(() => {
    refrescar()
    const intervalId = setInterval(refrescar, interval)
    return () => clearInterval(intervalId)
  }, [interval, refrescar])

  const revisar = useCallback(async (partidaUuid: string, grupoSocial: string) => {
    await revisarAnonimoPendiente(partidaUuid, grupoSocial)
    setPendientes((prev) => prev.filter((p) => p.partida_uuid !== partidaUuid))
  }, [])

  return { pendientes, revisar }
}
