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

/**
 * Gets or creates the annual Ground Coffee virtual bag for the current year.
 * This bag groups all Ground Coffee preparation events for tracking.
 *
 * The find-or-create happens atomically on the server (see
 * app/api/ground-coffee/route.ts) so it can't race with itself and so the
 * bag is created already CLOSED — it's bookkeeping only, not a real bag the
 * user should be able to open/finish from the Bags tab.
 */
export async function getOrCreateAnnualGroundCoffeeBag(): Promise<CoffeeBag> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/ground-coffee`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to set up ground coffee tracking')
  }

  const data: ApiResponse<CoffeeBag> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to set up ground coffee tracking')
  }

  return data.data
}
