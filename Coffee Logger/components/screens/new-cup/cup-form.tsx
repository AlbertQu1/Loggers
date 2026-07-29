'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CupSize, CoffeeBag } from '@/types'
import { registerCup } from '@/services/api/cups'
import { getBags } from '@/services/api/bags'
import { getOrCreateAnnualGroundCoffeeBag } from '@/services/api/ground-coffee'
import { getAlcoholTypes } from '@/services/api/alcohol-types'
import { getFlavors } from '@/services/api/flavors'
import { formatLocalDate } from '@/lib/utils'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { enqueueSyncItem } from '@/services/sync-queue'

const CUP_SIZES: { value: CupSize; label: string }[] = [
  { value: 'double', label: 'Double' },
  { value: 'quad', label: 'Quad' },
  { value: '6oz', label: '6 oz' },
  { value: '8oz', label: '8 oz' },
  { value: '10oz', label: '10 oz' },
  { value: '12oz', label: '12 oz' },
  { value: '14oz', label: '14 oz' },
  { value: '16oz', label: '16 oz' },
  { value: '18oz', label: '18 oz' },
]

export function CupForm() {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<CupSize | null>(null)
  const [cupsPrepared, setCupsPrepared] = useState(2)
  const [withMilk, setWithMilk] = useState(false)
  const [cold, setCold] = useState(false)
  const [useGroundCoffee, setUseGroundCoffee] = useState(false)
  const [multipleCups, setMultipleCups] = useState(false)
  const [containsAlcohol, setContainsAlcohol] = useState(false)
  const [selectedAlcohols, setSelectedAlcohols] = useState<Set<string>>(new Set())
  const [customAlcoholName, setCustomAlcoholName] = useState('')
  const [containsFlavor, setContainsFlavor] = useState(false)
  const [selectedFlavors, setSelectedFlavors] = useState<Set<string>>(new Set())
  const [customFlavorName, setCustomFlavorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeBag, setActiveBag] = useState<CoffeeBag | null>(null)
  const [loadingBag, setLoadingBag] = useState(true)
  const [alcoholTypeOptions, setAlcoholTypeOptions] = useState<string[]>([])
  const [flavorOptions, setFlavorOptions] = useState<string[]>([])

  const loadActiveBag = async () => {
    setLoadingBag(true)
    try {
      const bags = await getBags()
      const active = bags.find((b) => b.status === 'ACTIVE')
      setActiveBag(active || null)
    } catch (error) {
      console.error('Failed to load active bag:', error)
    } finally {
      setLoadingBag(false)
    }
  }

  useEffect(() => {
    loadActiveBag()
    getAlcoholTypes()
      .then((types) => setAlcoholTypeOptions([...types.map((t) => t.name), 'Other']))
      .catch((error) => console.error('Failed to load alcohol types:', error))
    getFlavors()
      .then((flavors) => setFlavorOptions([...flavors.map((f) => f.name), 'Other']))
      .catch((error) => console.error('Failed to load flavors:', error))
  }, [])

  const handleRegister = async () => {
    if (!selectedSize) {
      showToast('Please select a cup size', 'warning')
      return
    }

    setIsLoading(true)

    try {
      const alcoholTypes = Array.from(selectedAlcohols)
      if (selectedAlcohols.has('Other') && customAlcoholName) {
        alcoholTypes[alcoholTypes.indexOf('Other')] = customAlcoholName
      }

      const flavors = Array.from(selectedFlavors)
      if (selectedFlavors.has('Other') && customFlavorName) {
        flavors[flavors.indexOf('Other')] = customFlavorName
      }

      // Determine if we're using ground coffee
      const isUsingGroundCoffee = useGroundCoffee || !activeBag

      // If using ground coffee, get or create the annual virtual bag
      let groundCoffeeBagId: string | undefined = undefined
      if (isUsingGroundCoffee) {
        try {
          const groundCoffeeBag = await getOrCreateAnnualGroundCoffeeBag()
          groundCoffeeBagId = groundCoffeeBag.id
        } catch (error) {
          console.error('Failed to get ground coffee bag:', error)
          showToast('Unable to set up ground coffee tracking. Please try again.', 'error')
          setIsLoading(false)
          return
        }
      }

      const payload = {
        size: selectedSize,
        cups_prepared: multipleCups ? cupsPrepared : 1,
        cold,
        withMilk,
        useGroundCoffee: isUsingGroundCoffee,
        activeBagId: isUsingGroundCoffee ? groundCoffeeBagId : activeBag?.id,
        contains_alcohol: containsAlcohol,
        alcohol_types: containsAlcohol ? alcoholTypes : undefined,
        contains_flavor: containsFlavor,
        flavors: containsFlavor ? flavors : undefined,
      }

      await registerCup(payload)

      showToast('Preparation event recorded.', 'success')

      // Reset form
      setSelectedSize(null)
      setCupsPrepared(2)
      setCold(false)
      setWithMilk(false)
      setUseGroundCoffee(false)
      setMultipleCups(false)
      setContainsAlcohol(false)
      setSelectedAlcohols(new Set())
      setCustomAlcoholName('')
      setContainsFlavor(false)
      setSelectedFlavors(new Set())
      setCustomFlavorName('')
    } catch (error) {
      // Try to queue for offline sync
      try {
        const alcoholTypes = Array.from(selectedAlcohols)
        if (selectedAlcohols.has('Other') && customAlcoholName) {
          alcoholTypes[alcoholTypes.indexOf('Other')] = customAlcoholName
        }

        const flavors = Array.from(selectedFlavors)
        if (selectedFlavors.has('Other') && customFlavorName) {
          flavors[flavors.indexOf('Other')] = customFlavorName
        }

        const isUsingGroundCoffee = useGroundCoffee || !activeBag
        let groundCoffeeBagId: string | undefined = undefined

        // Try to get ground coffee bag for offline sync
        if (isUsingGroundCoffee) {
          try {
            const groundCoffeeBag = await getOrCreateAnnualGroundCoffeeBag()
            groundCoffeeBagId = groundCoffeeBag.id
          } catch (gcError) {
            console.error('Failed to get ground coffee bag for offline sync:', gcError)
          }
        }

        await enqueueSyncItem('POST', '/cups', {
          size: selectedSize,
          cups_prepared: multipleCups ? cupsPrepared : 1,
          cold,
          withMilk,
          useGroundCoffee: isUsingGroundCoffee,
          activeBagId: isUsingGroundCoffee ? groundCoffeeBagId : activeBag?.id,
          contains_alcohol: containsAlcohol,
          alcohol_types: containsAlcohol ? alcoholTypes : undefined,
          contains_flavor: containsFlavor,
          flavors: containsFlavor ? flavors : undefined,
        })

        showToast('Saved for later synchronization.', 'warning')

        // Reset form
        setSelectedSize(null)
        setCupsPrepared(2)
        setCold(false)
        setWithMilk(false)
        setUseGroundCoffee(false)
        setMultipleCups(false)
        setContainsAlcohol(false)
        setSelectedAlcohols(new Set())
        setCustomAlcoholName('')
        setContainsFlavor(false)
        setSelectedFlavors(new Set())
        setCustomFlavorName('')
      } catch (queueError) {
        showToast('The server is currently unavailable. Your information has been safely stored and will synchronize automatically.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingBag) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Active Bag */}
      {activeBag && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-foreground">{activeBag.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatLocalDate(activeBag.openedDate)}
          </span>
        </div>
      )}

      {/* No Active Bag Message */}
      {!activeBag && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-amber-900 dark:text-amber-50">
            No coffee bag is currently loaded.
            <br />
            This cup will automatically be registered as Ground Coffee.
          </p>
          <Button
            onClick={() => router.push('/bags')}
            variant="outline"
            className="w-full rounded-xl"
          >
            Open Coffee Bag
          </Button>
        </div>
      )}

      {/* Cup Size Selection */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Cup Size
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {CUP_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => setSelectedSize(size.value)}
              className={`p-4 rounded-2xl font-semibold text-base transition-all ${
                selectedSize === size.value
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Options - Toggle Chips */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Options
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setWithMilk(!withMilk)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              withMilk
                ? 'bg-foreground text-background'
                : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
            }`}
          >
            With Milk
          </button>

          <button
            onClick={() => setCold(!cold)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              cold
                ? 'bg-foreground text-background'
                : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
            }`}
          >
            Cold Coffee
          </button>

          {activeBag && (
            <button
              onClick={() => setUseGroundCoffee(!useGroundCoffee)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                useGroundCoffee
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
              }`}
            >
              Ground Coffee
            </button>
          )}

          <button
            onClick={() => setContainsAlcohol(!containsAlcohol)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              containsAlcohol
                ? 'bg-foreground text-background'
                : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
            }`}
          >
            Cocktail
          </button>

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

          <button
            onClick={() => setMultipleCups(!multipleCups)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              multipleCups
                ? 'bg-foreground text-background'
                : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
            }`}
          >
            Multiple Cups
          </button>
        </div>
      </div>

      {/* Cups Prepared Stepper - Only shown when Multiple Cups is enabled */}
      {multipleCups && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Cups Prepared
          </h2>
          <div className="flex items-center justify-center gap-6 bg-secondary rounded-2xl p-6">
            <button
              onClick={() => setCupsPrepared(Math.max(2, cupsPrepared - 1))}
              className="w-14 h-14 rounded-2xl bg-foreground text-background font-bold text-xl hover:opacity-90 transition-opacity"
            >
              −
            </button>
            <span className="text-4xl font-bold min-w-16 text-center">{cupsPrepared}</span>
            <button
              onClick={() => setCupsPrepared(Math.min(20, cupsPrepared + 1))}
              className="w-14 h-14 rounded-2xl bg-foreground text-background font-bold text-xl hover:opacity-90 transition-opacity"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Cocktail Ingredient Selection - Multi-Select Chips */}
      {containsAlcohol && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Cocktail Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {alcoholTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => {
                  const newSet = new Set(selectedAlcohols)
                  if (newSet.has(type)) {
                    newSet.delete(type)
                  } else {
                    newSet.add(type)
                  }
                  setSelectedAlcohols(newSet)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedAlcohols.has(type)
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {selectedAlcohols.has('Other') && (
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">Ingredient Name</label>
              <input
                type="text"
                value={customAlcoholName}
                onChange={(e) => setCustomAlcoholName(e.target.value)}
                placeholder="Enter ingredient name"
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground"
              />
            </div>
          )}
        </div>
      )}

      {/* Flavor Selection - Multi-Select Chips */}
      {containsFlavor && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Flavors
          </h3>
          <div className="flex flex-wrap gap-2">
            {flavorOptions.map((flavor) => (
              <button
                key={flavor}
                onClick={() => {
                  const newSet = new Set(selectedFlavors)
                  if (newSet.has(flavor)) {
                    newSet.delete(flavor)
                  } else {
                    newSet.add(flavor)
                  }
                  setSelectedFlavors(newSet)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFlavors.has(flavor)
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground border border-border hover:bg-secondary/80'
                }`}
              >
                {flavor}
              </button>
            ))}
          </div>

          {selectedFlavors.has('Other') && (
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">Flavor Name</label>
              <input
                type="text"
                value={customFlavorName}
                onChange={(e) => setCustomFlavorName(e.target.value)}
                placeholder="Enter flavor name"
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground"
              />
            </div>
          )}
        </div>
      )}

      {/* Register Button */}
      <Button
        onClick={handleRegister}
        disabled={isLoading || !selectedSize}
        className="w-full h-14 rounded-2xl text-base font-semibold"
      >
        {isLoading ? 'Recording...' : 'Record Event'}
      </Button>
    </div>
  )
}
