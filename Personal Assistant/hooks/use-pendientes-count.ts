'use client'

import { useEffect, useState } from 'react'
import { getPendientes } from '@/services/api/pendientes'
import { getPersonasPendientes, getFechasPendientes } from '@/services/api/personas'

// Cuenta las 3 fuentes que conviven en la bandeja unica de Pendientes
// (documentos, personas ambiguas, fechas detectadas) -- un solo badge en
// el nav, ya no uno separado por tipo.
export function usePendientesCount(interval: number = 60000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    function check() {
      Promise.all([
        getPendientes().catch(() => []),
        getPersonasPendientes().catch(() => []),
        getFechasPendientes().catch(() => []),
      ]).then(([documentos, personas, fechas]) => {
        setCount(documentos.length + personas.length + fechas.length)
      })
    }
    check()
    const intervalId = setInterval(check, interval)
    return () => clearInterval(intervalId)
  }, [interval])

  return count
}
