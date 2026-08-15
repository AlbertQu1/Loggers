'use client'

import { useEffect, useState } from 'react'
import { HealthStatus } from '@/types'
import { checkHealth } from '@/services/api/health'

export function useHealthCheck(interval: number = 30000) {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'offline',
    timestamp: new Date().toISOString(),
  })

  useEffect(() => {
    const performCheck = async () => setHealth(await checkHealth())
    performCheck()
    const intervalId = setInterval(performCheck, interval)
    return () => clearInterval(intervalId)
  }, [interval])

  return { health }
}
