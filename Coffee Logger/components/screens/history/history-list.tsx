'use client'

import { useEffect, useState } from 'react'
import { HistoryEntry, HistoryFilters } from '@/types'
import { getHistory } from '@/services/api/history'
import { showToast } from '@/components/common/toast-notifications'

export function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<HistoryFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const data = await getHistory(filters)
      setEntries(data)
    } catch (error) {
      showToast('Unable to connect to the server. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [filters])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEntryDisplay = (entry: HistoryEntry) => {
    switch (entry.type) {
      case 'cup': {
        const cupCount = entry.data.cups_prepared || 1
        const cupLabel = cupCount === 1 ? '1 Cup' : `${cupCount} Cups`
        const details = [
          entry.data.size,
          entry.data.cold ? 'Cold' : null,
          entry.data.withMilk ? 'with Milk' : null,
          entry.data.contains_alcohol ? 'with Cocktail' : null,
          entry.data.contains_flavor ? 'with Flavor' : null,
        ]
          .filter(Boolean)
          .join(', ')
        return {
          title: cupLabel,
          icon: '☕',
          description: details,
        }
      }
      case 'waste':
        return {
          title: 'Waste Recorded',
          icon: '🗑️',
          description: `${entry.data.grams}g wasted${entry.data.reason ? ` (${entry.data.reason})` : ''}`,
        }
      case 'bag_opened':
        return {
          title: 'Bag Opened',
          icon: '📦',
          description: entry.data.bagName || 'Coffee bag',
        }
      case 'bag_finished':
        return {
          title: 'Bag Finished',
          icon: '✅',
          description: entry.data.bagName || 'Coffee bag',
        }
      default:
        return { title: 'Event', icon: '•', description: '' }
    }
  }

  if (isLoading && entries.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Loading history...</div>
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-muted-foreground font-medium">No coffee events yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="bg-secondary rounded-2xl p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.groundCoffeeOnly || false}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, groundCoffeeOnly: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Ground Coffee Only</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.coldCoffeeOnly || false}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, coldCoffeeOnly: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Cold Coffee Only</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.withMilkOnly || false}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, withMilkOnly: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">With Milk Only</span>
          </label>
        </div>
      )}

      {/* History Entries */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const display = getEntryDisplay(entry)
          return (
            <div
              key={entry.id}
              className="bg-secondary rounded-2xl p-4 flex items-start gap-4"
            >
              <div className="text-2xl pt-1">{display.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">{display.title}</p>
                <p className="text-sm text-muted-foreground">{display.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(entry.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
