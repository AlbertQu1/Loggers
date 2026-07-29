import { ApiResponse, MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '@/types'

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

export interface RegisterMaintenancePayload {
  maintenanceType: MaintenanceType
  date: string
  notes?: string
}

export async function registerMaintenance(
  payload: RegisterMaintenancePayload
): Promise<MaintenanceRecord> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to register maintenance')
  }

  const data: ApiResponse<MaintenanceRecord> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to register maintenance')
  }

  return data.data
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/maintenance/status`)

  if (!response.ok) {
    throw new Error('Failed to fetch maintenance status')
  }

  const data: ApiResponse<MaintenanceStatus> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch maintenance status')
  }

  return data.data
}
