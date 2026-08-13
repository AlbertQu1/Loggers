'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  LugarPendiente,
  TipoLugarPendiente,
  getLugaresPendientes,
  revisarLugarPendiente,
} from '@/services/api/bgstats'

export function useLugaresPendientes(interval: number = 60000) {
  const [pendientes, setPendientes] = useState<LugarPendiente[]>([])

  const refrescar = useCallback(async () => {
    try {
      setPendientes(await getLugaresPendientes())
    } catch {
      // silencioso -- si el backend esta caido ya lo muestra el HealthIndicator
    }
  }, [])

  useEffect(() => {
    refrescar()
    const intervalId = setInterval(refrescar, interval)
    return () => clearInterval(intervalId)
  }, [interval, refrescar])

  const revisar = useCallback(async (tipo: TipoLugarPendiente, valor: string) => {
    await revisarLugarPendiente(tipo, valor)
    setPendientes((prev) => prev.filter((p) => !(p.tipo === tipo && p.valor === valor)))
  }, [])

  return { pendientes, revisar }
}
