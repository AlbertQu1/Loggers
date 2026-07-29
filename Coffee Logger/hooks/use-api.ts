'use client'

import { useState } from 'react'
import { enqueueSyncItem } from '@/services/sync-queue'

interface UseApiState {
  isLoading: boolean
  error: string | null
  data: any | null
}

export function useApi() {
  const [state, setState] = useState<UseApiState>({
    isLoading: false,
    error: null,
    data: null,
  })

  const execute = async <T,>(
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: Error) => void
      offlineHandler?: (method: string, endpoint: string, data?: any) => Promise<void>
    }
  ): Promise<{ success: boolean; data?: T; error?: Error }> => {
    setState({ isLoading: true, error: null, data: null })

    try {
      const result = await apiCall()
      setState({ isLoading: false, error: null, data: result })

      if (options?.onSuccess) {
        options.onSuccess(result)
      }

      return { success: true, data: result }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState({ isLoading: false, error: err.message, data: null })

      if (options?.onError) {
        options.onError(err)
      }

      return { success: false, error: err }
    }
  }

  const executeWithOfflineSupport = async <T,>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    endpoint: string,
    apiCall: () => Promise<T>,
    data?: any
  ): Promise<{ success: boolean; data?: T; error?: Error; queued?: boolean }> => {
    setState({ isLoading: true, error: null, data: null })

    try {
      const result = await apiCall()
      setState({ isLoading: false, error: null, data: result })
      return { success: true, data: result }
    } catch (error) {
      // Try to queue for later sync
      try {
        await enqueueSyncItem(method, endpoint, data)
        setState({
          isLoading: false,
          error: 'Queued for sync',
          data: null,
        })
        return { success: false, queued: true, error: new Error('Queued for sync') }
      } catch (queueError) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({ isLoading: false, error: err.message, data: null })
        return { success: false, error: err }
      }
    }
  }

  return {
    ...state,
    execute,
    executeWithOfflineSupport,
  }
}
