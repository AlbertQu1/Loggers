'use client'

import { useHealthCheck } from '@/hooks/use-health-check'
import { useSyncQueue } from '@/hooks/use-sync-queue'

export function HealthIndicator() {
  const { health } = useHealthCheck(30000)
  const { pendingCount, isSyncing } = useSyncQueue()

  const isConnected = health.status === 'connected'
  const hasPendingItems = pendingCount > 0

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={`Status: ${isConnected ? 'Connected' : 'Offline'}`}
      />
      <span className="text-xs font-medium text-muted-foreground">
        {isConnected ? 'Connected' : 'Offline'}
      </span>

      {hasPendingItems && (
        <>
          <div className="mx-2 w-px h-4 bg-border" />
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {pendingCount} pending
            {isSyncing && ' (syncing...)'}
          </span>
        </>
      )}
    </div>
  )
}
