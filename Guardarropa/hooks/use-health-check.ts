'use client'

import { useEffect, useState } from 'react'
import { HealthStatus } from '@/types'
import { checkHealth } from '@/services/api/health'

export function useHealthCheck(interval: number = 30000) {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'offline',
    timestamp: new Date().toISOString(),
  })
  const [isChecking, setIsChecking] = useState(false)

  const performCheck = async () => {
    setIsChecking(true)
    try {
      const result = await checkHealth()
      setHealth(result)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    performCheck()
    const intervalId = setInterval(performCheck, interval)
    return () => clearInterval(intervalId)
  }, [interval])

  return {
    health,
    isChecking,
    refetch: performCheck,
  }
}
