'use client'

import { useEffect, useState } from 'react'
import { getPersonasPendientes } from '@/services/api/personas'

export function usePersonasPendientesCount(interval: number = 60000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    function check() {
      getPersonasPendientes()
        .then((lista) => setCount(lista.length))
        .catch(() => {})
    }
    check()
    const intervalId = setInterval(check, interval)
    return () => clearInterval(intervalId)
  }, [interval])

  return count
}
