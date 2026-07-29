import { HistoryEntry, HistoryFilters, ApiResponse } from '@/types'

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

export async function getHistory(filters?: HistoryFilters): Promise<HistoryEntry[]> {
  const params = new URLSearchParams()

  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.bagId) params.append('bagId', filters.bagId)
  if (filters?.groundCoffeeOnly) params.append('groundCoffeeOnly', 'true')
  if (filters?.coldCoffeeOnly) params.append('coldCoffeeOnly', 'true')
  if (filters?.withMilkOnly) params.append('withMilkOnly', 'true')

  const queryString = params.toString()
  const url = `${API_BASE_URL}/history${queryString ? `?${queryString}` : ''}`

  const response = await fetchWithTimeout(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to fetch history')
  }

  const data: ApiResponse<HistoryEntry[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch history')
  }

  return data.data
}
