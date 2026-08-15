import { HealthStatus } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8002'
const TIMEOUT = 5000

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`)
    if (!response.ok) {
      return { status: 'offline', timestamp: new Date().toISOString() }
    }
    return { status: 'connected', timestamp: new Date().toISOString() }
  } catch {
    return { status: 'offline', timestamp: new Date().toISOString() }
  }
}
