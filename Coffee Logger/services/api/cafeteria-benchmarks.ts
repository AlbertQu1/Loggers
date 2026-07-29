import { ApiResponse, CafeteriaBenchmark } from '@/types'

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

export interface RegisterCafeteriaBenchmarkPayload {
  cafeteriaName: string
  city: string
  price: number
}

export async function registerCafeteriaBenchmark(
  payload: RegisterCafeteriaBenchmarkPayload
): Promise<CafeteriaBenchmark> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/cafeteria-benchmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to register cafeteria benchmark')
  }

  const data: ApiResponse<CafeteriaBenchmark> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to register cafeteria benchmark')
  }

  return data.data
}

export async function getCafeteriaBenchmarks(): Promise<CafeteriaBenchmark[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/cafeteria-benchmarks`)

  if (!response.ok) {
    throw new Error('Failed to fetch cafeteria benchmarks')
  }

  const data: ApiResponse<CafeteriaBenchmark[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch cafeteria benchmarks')
  }

  return data.data
}
