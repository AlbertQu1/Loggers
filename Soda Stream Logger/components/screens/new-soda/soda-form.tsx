'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cylinder, Flavor } from '@/types'
import { registerPreparation } from '@/services/api/preparations'
import { getCylinders } from '@/services/api/cylinders'
import { getFlavors } from '@/services/api/flavors'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { formatLocalDate } from '@/lib/utils'

const MAX_BOTTLES = 5

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-2.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-lg bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity"
        >
          −
        </button>
        <span className="text-base font-semibold min-w-5 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-lg bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity"
        >
          +
        </button>
      </div>
    </div>
  )
}

export function SodaForm() {
  const router = useRouter()
  const [shotsLight, setShotsLight] = useState(0)
  const [shotsMedium, setShotsMedium] = useState(0)
  const [shotsStrong, setShotsStrong] = useState(0)
  const [bottlesPrepared, setBottlesPrepared] = useState(1)
  const [containsFlavor, setContainsFlavor] = useState(false)
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null)
  const [ml, setMl] = useState('')
  const [flavorOptions, setFlavorOptions] = useState<Flavor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeCylinder, setActiveCylinder] = useState<Cylinder | null>(null)
  const [loadingCylinder, setLoadingCylinder] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoadingCylinder(true)
      try {
        const cylinders = await getCylinders()
        const active = cylinders.find((c) => c.status === 'ACTIVE')
        setActiveCylinder(active || null)
      } catch (error) {
        console.error('Failed to load cylinders:', error)
      } finally {
        setLoadingCylinder(false)
      }
    }
    load()
    getFlavors()
      .then(setFlavorOptions)
      .catch((error) => console.error('Failed to load flavors:', error))
  }, [])

  const totalShots = shotsLight + shotsMedium + shotsStrong
  const selectedFlavor = flavorOptions.find((f) => f.id === selectedFlavorId)
  const mlRequired = containsFlavor && !!selectedFlavorId && !selectedFlavor?.alwaysAvailable
  const mlMissing = mlRequired && !ml

  const handleRegister = async () => {
    if (totalShots <= 0) {
      showToast('Please add at least one shot', 'warning')
      return
    }

    if (mlMissing) {
      showToast('Enter the ml used for this flavor', 'warning')
      return
    }

    setIsLoading(true)

    try {
      await registerPreparation({
        shotsLight,
        shotsMedium,
        shotsStrong,
        bottlesPrepared,
        flavorId: containsFlavor && selectedFlavorId ? selectedFlavorId : undefined,
        ml: containsFlavor && ml ? parseInt(ml) : undefined,
      })

      showToast('Soda recorded.', 'success')

      setShotsLight(0)
      setShotsMedium(0)
      setShotsStrong(0)
      setBottlesPrepared(1)
      setContainsFlavor(false)
      setSelectedFlavorId(null)
      setMl('')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to connect to the server.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingCylinder) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!activeCylinder) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4">
        <p className="text-sm text-amber-900 dark:text-amber-50">
          No active tank. You need a tank in the machine before logging a soda.
        </p>
        <Button
          onClick={() => router.push('/tanks')}
          variant="outline"
          className="w-full rounded-xl"
        >
          Go to Tanks
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Cylinder */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-foreground">{activeCylinder.label}</span>
        <span className="text-xs text-muted-foreground">
          {formatLocalDate(activeCylinder.openedDate)}
        </span>
      </div>

      {/* Bottles */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Bottles
        </h2>
        <Stepper
          label="Bottles prepared"
          value={bottlesPrepared}
          onChange={setBottlesPrepared}
          min={1}
          max={MAX_BOTTLES}
        />
      </div>

      {/* Shots */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Shots
        </h2>
        <Stepper label="Strong" value={shotsStrong} onChange={setShotsStrong} />
        <Stepper label="Medium" value={shotsMedium} onChange={setShotsMedium} />
        <Stepper label="Light" value={shotsLight} onChange={setShotsLight} />
      </div>

      {/* Flavor Toggle */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Options
        </h2>
        <button
          onClick={() => setContainsFlavor(!containsFlavor)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            containsFlavor
              ? 'bg-foreground text-background'
              : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
          }`}
        >
          Flavor
        </button>
      </div>

      {/* Flavor Selection */}
      {containsFlavor && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Flavor
          </h3>
          <div className="flex flex-wrap gap-2">
            {flavorOptions.map((flavor) => (
              <button
                key={flavor.id}
                onClick={() =>
                  setSelectedFlavorId(selectedFlavorId === flavor.id ? null : flavor.id)
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFlavorId === flavor.id
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
                }`}
              >
                {flavor.name}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Syrup (ml){mlRequired ? ' *' : ''}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={ml}
              onChange={(e) => setMl(e.target.value)}
              placeholder="Enter ml"
              className="w-full px-4 py-3 rounded-xl border bg-background text-foreground"
            />
          </div>
        </div>
      )}

      {/* Register Button */}
      <Button
        onClick={handleRegister}
        disabled={isLoading || totalShots <= 0 || mlMissing}
        className="w-full h-14 rounded-2xl text-base font-semibold"
      >
        {isLoading ? 'Recording...' : 'Record Soda'}
      </Button>
    </div>
  )
}
