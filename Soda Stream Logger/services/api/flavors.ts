import { ApiResponse, Flavor } from '@/types'

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

export interface CreateFlavorPayload {
  name: string
  brand?: string
  cost?: number
  ml?: number
  purchaseDate?: string
}

// Only available flavors (for the New Soda picker)
export async function getFlavors(): Promise<Flavor[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/flavors`)

  if (!response.ok) {
    throw new Error('Failed to fetch flavors')
  }

  const data: ApiResponse<Flavor[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch flavors')
  }

  return data.data
}

// All flavor entries (for the management screen)
export async function getAllFlavors(): Promise<Flavor[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/flavors/all`)

  if (!response.ok) {
    throw new Error('Failed to fetch flavors')
  }

  const data: ApiResponse<Flavor[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch flavors')
  }

  return data.data
}

export async function createFlavor(payload: CreateFlavorPayload): Promise<Flavor> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/flavors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data: ApiResponse<Flavor> = await response.json()

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error || 'Failed to create flavor')
  }

  return data.data
}

export async function finishFlavor(flavorId: string): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/flavors/${flavorId}/finish`, {
    method: 'PATCH',
  })

  const data: ApiResponse<{ id: string }> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to finish flavor')
  }
}
