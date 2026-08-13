'use client'

import { useCallback, useEffect, useState } from 'react'
import { AmigoPendiente, getAmigosPendientes, revisarAmigoPendiente } from '@/services/api/bgstats'

export function useAmigosPendientes(interval: number = 60000) {
  const [pendientes, setPendientes] = useState<AmigoPendiente[]>([])

  const refrescar = useCallback(async () => {
    try {
      setPendientes(await getAmigosPendientes())
    } catch {
      // silencioso -- si el backend esta caido ya lo muestra el HealthIndicator
    }
  }, [])

  useEffect(() => {
    refrescar()
    const intervalId = setInterval(refrescar, interval)
    return () => clearInterval(intervalId)
  }, [interval, refrescar])

  const revisar = useCallback(async (bggUsername: string) => {
    await revisarAmigoPendiente(bggUsername)
    setPendientes((prev) => prev.filter((p) => p.bgg_username !== bggUsername))
  }, [])

  return { pendientes, revisar }
}
