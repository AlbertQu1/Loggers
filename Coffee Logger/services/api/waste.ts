import { WasteEntry, ApiResponse } from '@/types'

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

export interface CreateWastePayload {
  coffeeBagId: string
  date: string
  grams: number
  reason?: string
  notes?: string
}

export async function registerWaste(payload: CreateWastePayload): Promise<WasteEntry> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/waste`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to register waste')
  }

  const data: ApiResponse<WasteEntry> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to register waste')
  }

  return data.data
}
