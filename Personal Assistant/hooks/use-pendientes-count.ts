'use client'

import { useEffect, useState } from 'react'
import { getPendientes } from '@/services/api/pendientes'

export function usePendientesCount(interval: number = 60000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    function check() {
      getPendientes()
        .then((lista) => setCount(lista.length))
        .catch(() => {})
    }
    check()
    const intervalId = setInterval(check, interval)
    return () => clearInterval(intervalId)
  }, [interval])

  return count
}
