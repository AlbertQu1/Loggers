import { ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
const TIMEOUT = 30000

export interface AlcoholType {
  id: number
  name: string
}

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

export async function getAlcoholTypes(): Promise<AlcoholType[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/alcohol-types`)

  if (!response.ok) {
    throw new Error('Failed to fetch alcohol types')
  }

  const data: ApiResponse<AlcoholType[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch alcohol types')
  }

  return data.data
}
