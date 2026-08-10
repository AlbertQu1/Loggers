import { ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

export interface LatestPrediction {
  coffee_name: string
  predicted_total_cups: number
  predicted_cycle_days: number
  prediction_date: string
}

export async function getLatestPrediction(): Promise<LatestPrediction | null> {
  const response = await fetch(`${API_BASE_URL}/bag-predictions/latest`)
  const data: ApiResponse<LatestPrediction | null> = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch prediction')
  }

  return data.data ?? null
}
