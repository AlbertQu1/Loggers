'use client'

import { useEffect, useState } from 'react'
import { CylinderHistory } from '@/types'
import { getCylinderHistory } from '@/services/api/history'
import { showToast } from '@/components/common/toast-notifications'

function intensitySummary(light: number, medium: number, strong: number): string {
  return [
    light ? `${light}L` : null,
    medium ? `${medium}M` : null,
    strong ? `${strong}S` : null,
  ]
    .filter(Boolean)
    .join(' ')
}

export function HistoryList() {
  const [history, setHistory] = useState<CylinderHistory | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCylinderHistory()
        setHistory(data)
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to load history', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return <div className="text-center py-8">Loading history...</div>
  }

  if (!history || (history.closed.length === 0 && !history.active)) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📜</div>
        <p className="text-muted-foreground font-medium">No cylinder history yet.</p>
      </div>
    )
  }

  const { closed, active } = history

  return (
    <div className="space-y-6">
      {active && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-50">
            Current tank — {active.label}
          </h2>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">
            {active.totalLiters}L so far
          </p>
          {active.predictedTotal !== null && (
            <p className="text-sm text-blue-800 dark:text-blue-100">
              ~{Math.round(active.predictedTotal)}L predicted total (avg of past tanks) · ~
              {Math.round(active.predictedRemaining ?? 0)}L left
            </p>
          )}

          {active.preparations.length > 0 && (
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900/70 dark:text-blue-50/70">
                Preparations
              </h3>
              <div className="space-y-1.5">
                {active.preparations.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm bg-white/60 dark:bg-black/20 rounded-lg px-3 py-2"
                  >
                    <span className="text-blue-900 dark:text-blue-50">
                      {new Date(p.timestamp).toLocaleDateString()}
                      {p.flavorName ? ` · ${p.flavorName}` : ''}
                    </span>
                    <span className="text-blue-800 dark:text-blue-100 font-medium">
                      {intensitySummary(p.shotsLight, p.shotsMedium, p.shotsStrong)} ·{' '}
                      {p.bottlesPrepared} bottle{p.bottlesPrepared === 1 ? '' : 's'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {closed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Past Tanks
          </h2>
          {closed.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between bg-secondary/50 rounded-2xl p-4"
            >
              <p className="font-semibold text-base">{c.label}</p>
              <p className="text-sm text-muted-foreground">{c.totalLiters}L</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
