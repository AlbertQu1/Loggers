import { ApiResponse, Preparation } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
const TIMEOUT = 30000

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

export interface CreatePreparationPayload {
  shotsLight: number
  shotsMedium: number
  shotsStrong: number
  bottlesPrepared: number
  flavorId?: string
  ml?: number
}

export async function registerPreparation(
  payload: CreatePreparationPayload
): Promise<Preparation> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/preparations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data: ApiResponse<Preparation> = await response.json()

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error || 'Failed to register preparation')
  }

  return data.data
}
