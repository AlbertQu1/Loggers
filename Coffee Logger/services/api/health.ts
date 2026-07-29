import { HealthStatus, ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
const TIMEOUT = 5000

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

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`)

    if (!response.ok) {
      return {
        status: 'offline',
        timestamp: new Date().toISOString(),
      }
    }

    return {
      status: 'connected',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'offline',
      timestamp: new Date().toISOString(),
    }
  }
}
