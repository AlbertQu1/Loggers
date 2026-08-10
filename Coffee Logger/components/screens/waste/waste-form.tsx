'use client'

import { useEffect, useState } from 'react'
import { CoffeeBag, MaintenanceType } from '@/types'
import { registerWaste, getRecentWaste, RecentWasteEvent } from '@/services/api/waste'
import { getBags } from '@/services/api/bags'
import {
  registerMaintenance,
  getMaintenanceStatus,
} from '@/services/api/maintenance'
import {
  registerCafeteriaBenchmark,
  getCafeteriaBenchmarks,
} from '@/services/api/cafeteria-benchmarks'
import { getPurchaseLocations, PurchaseLocation } from '@/services/api/purchase-locations'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'

export function WasteForm() {
  const [mode, setMode] = useState<'waste' | 'maintenance' | 'benchmark'>('waste')

  // Maintenance alert banner (shown regardless of mode)
  const [needsClean, setNeedsClean] = useState(false)
  const [needsDescale, setNeedsDescale] = useState(false)
  const [lastCleanDate, setLastCleanDate] = useState<string | null>(null)
  const [lastDescaleDate, setLastDescaleDate] = useState<string | null>(null)

  // Waste form state
  const [bags, setBags] = useState<CoffeeBag[]>([])
  const [activeBag, setActiveBag] = useState<CoffeeBag | null>(null)
  const [selectedBagId, setSelectedBagId] = useState('')
  const [grams, setGrams] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBags, setIsLoadingBags] = useState(true)
  const [recentWaste, setRecentWaste] = useState<RecentWasteEvent[]>([])

  const loadRecentWaste = async () => {
    try {
      setRecentWaste(await getRecentWaste())
    } catch (error) {
      console.error('Failed to load recent waste:', error)
    }
  }

  // Maintenance form state
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('CLEAN')
  const [maintenanceDate, setMaintenanceDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [maintenanceNotes, setMaintenanceNotes] = useState('')
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false)

  // Benchmark form state (feeds coffee_WIP.py, not used by the app itself)
  const [benchmarkName, setBenchmarkName] = useState('')
  const [benchmarkCity, setBenchmarkCity] = useState('CDMX')
  const [benchmarkPrice, setBenchmarkPrice] = useState('')
  const [isSubmittingBenchmark, setIsSubmittingBenchmark] = useState(false)
  const [currentYearAverage, setCurrentYearAverage] = useState<number | null>(null)
  const [benchmarkCityOptions, setBenchmarkCityOptions] = useState<PurchaseLocation[]>([])

  const loadBenchmarkAverage = async () => {
    try {
      const benchmarks = await getCafeteriaBenchmarks()
      const currentYear = new Date().getFullYear()
      const thisYear = benchmarks.filter((b) => b.year === currentYear)
      if (thisYear.length === 0) {
        setCurrentYearAverage(null)
        return
      }
      const average = thisYear.reduce((sum, b) => sum + b.price, 0) / thisYear.length
      setCurrentYearAverage(average)
    } catch (error) {
      console.error('Failed to load cafeteria benchmarks:', error)
    }
  }

  const loadMaintenanceStatus = async () => {
    try {
      const status = await getMaintenanceStatus()
      setNeedsClean(status.needsClean)
      setNeedsDescale(status.needsDescale)
      setLastCleanDate(status.lastCleanDate)
      setLastDescaleDate(status.lastDescaleDate)
    } catch (error) {
      console.error('Failed to load maintenance status:', error)
    }
  }

  useEffect(() => {
    const loadBags = async () => {
      setIsLoadingBags(true)
      try {
        const data = await getBags()
        const nonClosedBags = data.filter((b) => b.status !== 'CLOSED')
        setBags(nonClosedBags)

        // Default to ACTIVE bag
        const active = nonClosedBags.find((b) => b.status === 'ACTIVE')
        if (active) {
          setActiveBag(active)
          setSelectedBagId(active.id)
        }
      } catch (error) {
        showToast('Unable to connect to the server. Please try again.', 'error')
      } finally {
        setIsLoadingBags(false)
      }
    }

    loadBags()
    loadMaintenanceStatus()
    loadBenchmarkAverage()
    loadRecentWaste()
    getPurchaseLocations()
      .then(setBenchmarkCityOptions)
      .catch((error) => console.error('Failed to load purchase locations:', error))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBagId || !grams) {
      showToast('Please select a bag and enter grams', 'warning')
      return
    }

    const gramsValue = parseInt(grams)
    if (isNaN(gramsValue) || gramsValue < 1) {
      showToast('Coffee lost must be at least 1 gram', 'warning')
      return
    }

    setIsLoading(true)

    try {
      await registerWaste({
        coffeeBagId: selectedBagId,
        date: new Date().toISOString().split('T')[0],
        grams: gramsValue,
        notes: notes || undefined,
      })

      showToast('Waste recorded.', 'success')
      await loadRecentWaste()

      // Reset form
      if (activeBag) {
        setSelectedBagId(activeBag.id)
      } else {
        setSelectedBagId('')
      }
      setGrams('')
      setNotes('')
    } catch (error) {
      showToast('Unable to connect to the server. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingMaintenance(true)

    try {
      await registerMaintenance({
        maintenanceType,
        date: maintenanceDate,
        notes: maintenanceNotes || undefined,
      })

      showToast(
        maintenanceType === 'CLEAN' ? 'Cleaning recorded.' : 'Descaling recorded.',
        'success'
      )

      setMaintenanceDate(new Date().toISOString().split('T')[0])
      setMaintenanceNotes('')
      await loadMaintenanceStatus()
    } catch (error) {
      showToast('Unable to connect to the server. Please try again.', 'error')
    } finally {
      setIsSubmittingMaintenance(false)
    }
  }

  const handleSubmitBenchmark = async (e: React.FormEvent) => {
    e.preventDefault()

    const priceValue = parseFloat(benchmarkPrice)

    if (!benchmarkName || isNaN(priceValue)) {
      showToast('Please fill in cafeteria name and price', 'warning')
      return
    }

    setIsSubmittingBenchmark(true)

    try {
      await registerCafeteriaBenchmark({
        cafeteriaName: benchmarkName,
        city: benchmarkCity || 'CDMX',
        price: priceValue,
      })

      showToast('Benchmark recorded.', 'success')

      setBenchmarkName('')
      setBenchmarkPrice('')
      await loadBenchmarkAverage()
    } catch (error) {
      showToast('Unable to connect to the server. Please try again.', 'error')
    } finally {
      setIsSubmittingBenchmark(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 bg-secondary rounded-2xl p-1">
        <button
          onClick={() => setMode('maintenance')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === 'maintenance' ? 'bg-foreground text-background' : 'text-foreground'
          }`}
        >
          Maintenance
        </button>
        <button
          onClick={() => setMode('waste')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === 'waste' ? 'bg-foreground text-background' : 'text-foreground'
          }`}
        >
          Waste
        </button>
        <button
          onClick={() => setMode('benchmark')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === 'benchmark' ? 'bg-foreground text-background' : 'text-foreground'
          }`}
        >
          Benchmark
        </button>
      </div>

      {/* Maintenance Alert Banner */}
      {(needsClean || needsDescale) && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <p className="text-sm font-semibold text-red-900 dark:text-red-50">
            ⚠️ Maintenance needed:{' '}
            {[needsClean && 'Clean', needsDescale && 'Descale'].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}

      {mode === 'waste' && (
        isLoadingBags ? (
          <div className="text-center py-8">Loading bags...</div>
        ) : bags.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🗑️</div>
            <p className="text-muted-foreground font-medium">No bags available to record waste.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coffee Bag */}
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Coffee Bag
              </label>
              <select
                value={selectedBagId}
                onChange={(e) => setSelectedBagId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-secondary"
              >
                <option value="">Select a bag...</option>
                {bags.map((bag) => (
                  <option key={bag.id} value={bag.id}>
                    {bag.name}
                    {bag.status === 'ACTIVE' ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Coffee Lost (grams) */}
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Coffee Lost (grams)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="Enter grams"
                min="1"
                step="1"
                className="w-full px-4 py-3 rounded-xl border bg-secondary"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-secondary resize-none"
              />
            </div>

            {/* Record Waste Button */}
            <Button
              type="submit"
              disabled={isLoading || !selectedBagId || !grams}
              className="w-full h-14 rounded-2xl text-base font-semibold"
            >
              {isLoading ? 'Recording...' : 'Record Waste'}
            </Button>
          </form>
        )
      )}

      {mode === 'waste' && recentWaste.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recent Waste
          </label>
          {recentWaste.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-sm"
            >
              <div>
                <p className="font-medium">{event.coffeeName}</p>
                <p className="text-muted-foreground text-xs">
                  {event.date}
                  {event.reason ? ` · ${event.reason}` : ''}
                </p>
              </div>
              <p className="font-semibold">{event.grams}g</p>
            </div>
          ))}
        </div>
      )}

      {mode === 'maintenance' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Clean</p>
            <p className="text-lg font-bold">{lastCleanDate || 'Never'}</p>
          </div>
          <div className="bg-secondary rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Descale</p>
            <p className="text-lg font-bold">{lastDescaleDate || 'Never'}</p>
          </div>
        </div>
      )}

      {mode === 'maintenance' && (
        <form onSubmit={handleSubmitMaintenance} className="space-y-6">
          {/* Maintenance Type */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMaintenanceType('CLEAN')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  maintenanceType === 'CLEAN'
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground border border-border'
                }`}
              >
                Clean
              </button>
              <button
                type="button"
                onClick={() => setMaintenanceType('DESCALE')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  maintenanceType === 'DESCALE'
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground border border-border'
                }`}
              >
                Descale
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Date
            </label>
            <input
              type="date"
              value={maintenanceDate}
              onChange={(e) => setMaintenanceDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Notes
            </label>
            <textarea
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border bg-secondary resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmittingMaintenance}
            className="w-full h-14 rounded-2xl text-base font-semibold"
          >
            {isSubmittingMaintenance ? 'Recording...' : 'Record Maintenance'}
          </Button>
        </form>
      )}

      {mode === 'benchmark' && (
        <div className="space-y-6">
          {currentYearAverage !== null && (
            <div className="bg-secondary rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Average price · {new Date().getFullYear()}
              </p>
              <p className="text-2xl font-bold">${currentYearAverage.toFixed(2)}</p>
            </div>
          )}

          <form onSubmit={handleSubmitBenchmark} className="space-y-6">
            {/* Cafeteria Name */}
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Cafeteria Name
              </label>
              <input
                type="text"
                value={benchmarkName}
                onChange={(e) => setBenchmarkName(e.target.value)}
                placeholder="e.g., Starbucks"
                className="w-full px-4 py-3 rounded-xl border bg-secondary"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                City
              </label>
              <select
                value={benchmarkCity}
                onChange={(e) => setBenchmarkCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-secondary"
              >
                {benchmarkCityOptions.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Double Espresso Price
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={benchmarkPrice}
                onChange={(e) => setBenchmarkPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full px-4 py-3 rounded-xl border bg-secondary"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmittingBenchmark || !benchmarkName || !benchmarkPrice}
              className="w-full h-14 rounded-2xl text-base font-semibold"
            >
              {isSubmittingBenchmark ? 'Recording...' : 'Record Benchmark'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
