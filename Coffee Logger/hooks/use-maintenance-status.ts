'use client'

import { useEffect, useState } from 'react'
import { MaintenanceStatus } from '@/types'
import { getMaintenanceStatus } from '@/services/api/maintenance'

const DEFAULT_STATUS: MaintenanceStatus = {
  cupsSinceClean: 0,
  cupsSinceDescale: 0,
  needsClean: false,
  needsDescale: false,
  lastCleanDate: null,
  lastDescaleDate: null,
}

export function useMaintenanceStatus(interval: number = 30000) {
  const [status, setStatus] = useState<MaintenanceStatus>(DEFAULT_STATUS)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const result = await getMaintenanceStatus()
        if (!cancelled) setStatus(result)
      } catch (error) {
        console.error('Failed to load maintenance status:', error)
      }
    }

    check()
    const intervalId = setInterval(check, interval)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [interval])

  return status
}
