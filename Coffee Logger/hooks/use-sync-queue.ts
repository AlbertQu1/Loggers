'use client'

import { useEffect, useState } from 'react'
import { syncPendingItems, getPendingCount, setupConnectivityListener } from '@/services/sync-queue'

export function useSyncQueue() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const updatePendingCount = async () => {
    try {
      const count = await getPendingCount()
      setPendingCount(count)
    } catch (error) {
      console.error('[v0] Failed to get pending count:', error)
    }
  }

  const sync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncPendingItems()
      setLastSync(new Date().toISOString())
      await updatePendingCount()
      return result
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    updatePendingCount()

    // Set up connectivity listener
    const cleanup = setupConnectivityListener(() => {
      sync()
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  return {
    pendingCount,
    isSyncing,
    lastSync,
    sync,
    updatePendingCount,
  }
}
