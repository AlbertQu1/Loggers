'use client'

import { useEffect, useState } from 'react'
import { getLatestPrediction, LatestPrediction } from '@/services/api/bag-predictions'

export function PredictionBanner() {
  const [prediction, setPrediction] = useState<LatestPrediction | null>(null)

  useEffect(() => {
    getLatestPrediction()
      .then(setPrediction)
      .catch((error) => console.error('[PredictionBanner]', error))
  }, [])

  if (!prediction) return null

  const date = new Date(prediction.prediction_date).toLocaleDateString('es-MX')

  return (
    <div className="mb-6 px-4 py-2 text-xs text-center rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
      🤖 {prediction.coffee_name}: el modelo predice ~{prediction.predicted_total_cups.toFixed(0)} tazas
      en ~{prediction.predicted_cycle_days.toFixed(0)} días (última corrida: {date})
    </div>
  )
}
