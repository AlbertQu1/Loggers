import { CoffeeBag, ApiResponse } from '@/types'

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

export interface CreateBagPayload {
  name: string
  roaster: string
  city?: string
  country?: string
  purchaseDate: string
  weight: number
  price: number
  gift: boolean
  notes?: string
}

export async function getBags(): Promise<CoffeeBag[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/bags`)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to fetch bags')
  }

  const data: ApiResponse<CoffeeBag[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch bags')
  }

  return data.data
}

export async function createBag(payload: CreateBagPayload): Promise<CoffeeBag> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/bags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to create bag')
  }

  const data: ApiResponse<CoffeeBag> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to create bag')
  }

  return data.data
}

export async function openBag(bagId: string): Promise<CoffeeBag> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/bags/${bagId}/open`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to open bag')
  }

  const data: ApiResponse<CoffeeBag> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to open bag')
  }

  return data.data
}

export async function finishBag(bagId: string): Promise<CoffeeBag> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/bags/${bagId}/finish`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to finish bag')
  }

  const data: ApiResponse<CoffeeBag> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to finish bag')
  }

  return data.data
}
