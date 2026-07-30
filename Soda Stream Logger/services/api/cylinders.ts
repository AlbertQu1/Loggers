import { ApiResponse, Cylinder } from '@/types'

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

export interface CreateCylinderPayload {
  price: number
  notes?: string
  quantity: number
}

export async function getCylinders(): Promise<Cylinder[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/cylinders`)

  if (!response.ok) {
    throw new Error('Failed to fetch cylinders')
  }

  const data: ApiResponse<Cylinder[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch cylinders')
  }

  return data.data
}

export async function createCylinders(payload: CreateCylinderPayload): Promise<Cylinder[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/cylinders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data: ApiResponse<Cylinder[]> = await response.json()

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error || 'Failed to create cylinder')
  }

  return data.data
}

export async function changeTank(): Promise<Cylinder> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/cylinders/change-tank`, {
    method: 'POST',
  })

  const data: ApiResponse<Cylinder> = await response.json()

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error || 'Failed to change tank')
  }

  return data.data
}
