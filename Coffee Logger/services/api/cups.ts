import { Cup, CupSize, ApiResponse } from '@/types'

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

export interface CreateCupPayload {
  size: CupSize
  cups_prepared: number
  cold: boolean
  withMilk: boolean
  useGroundCoffee: boolean
  activeBagId?: string
  contains_alcohol: boolean
  alcohol_types?: string[]
  contains_flavor: boolean
  flavors?: string[]
}

export async function registerCup(payload: CreateCupPayload): Promise<Cup> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/cups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to register cup')
  }

  const data: ApiResponse<Cup> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to register cup')
  }

  return data.data
}
