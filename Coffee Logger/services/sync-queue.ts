import {
  addToSyncQueue,
  getPendingItems,
  removeSyncItem,
  updateSyncItemError,
  updateSyncItemStatus,
} from '@/lib/storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
const TIMEOUT = 30000

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function enqueueSyncItem(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
) {
  const id = `${Date.now()}-${Math.random()}`

  await addToSyncQueue({
    id,
    method,
    endpoint,
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  })

  return id
}

export async function syncPendingItems(): Promise<{
  succeeded: number
  failed: number
}> {
  const items = await getPendingItems()
  let succeeded = 0
  let failed = 0

  for (const item of items) {
    try {
      await updateSyncItemStatus(item.id, 'in_progress')

      const response = await fetchWithTimeout(`${API_BASE_URL}${item.endpoint}`, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: item.data ? JSON.stringify(item.data) : undefined,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || `HTTP ${response.status}`)
      }

      await removeSyncItem(item.id)
      succeeded++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await updateSyncItemError(item.id, errorMessage)
      failed++
    }
  }

  return { succeeded, failed }
}

export async function getPendingCount(): Promise<number> {
  const items = await getPendingItems()
  return items.length
}

export function setupConnectivityListener(onSync: () => void) {
  if (typeof window === 'undefined') return

  const handleOnline = () => {
    onSync()
  }

  window.addEventListener('online', handleOnline)

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}
