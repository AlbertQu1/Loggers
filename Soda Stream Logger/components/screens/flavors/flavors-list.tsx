'use client'

import { useEffect, useState } from 'react'
import { Flavor } from '@/types'
import { getAllFlavors, finishFlavor } from '@/services/api/flavors'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatLocalDate } from '@/lib/utils'
import { CreateFlavorModal } from './create-flavor-modal'

export function FlavorsList() {
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [finishingId, setFinishingId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadFlavors = async () => {
    setIsLoading(true)
    try {
      const data = await getAllFlavors()
      setFlavors(data)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load flavors', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFlavors()
  }, [])

  const handleFinish = async (flavorId: string) => {
    setFinishingId(flavorId)
    try {
      await finishFlavor(flavorId)
      showToast('Flavor marked as finished.', 'success')
      await loadFlavors()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to finish flavor.', 'error')
    } finally {
      setFinishingId(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading flavors...</div>
  }

  return (
    <div className="space-y-6">
      {flavors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🍋</div>
          <p className="text-muted-foreground font-medium">No flavors yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flavors.map((flavor) => {
            const isAvailable = flavor.alwaysAvailable || !flavor.finishedDate
            const details = [
              flavor.brand,
              flavor.cost !== null ? `$${flavor.cost}` : null,
              flavor.ml ? `${flavor.ml}ml` : null,
              flavor.purchaseDate ? formatLocalDate(flavor.purchaseDate) : null,
            ]
              .filter(Boolean)
              .join(' · ')

            return (
              <div
                key={flavor.id}
                className={`rounded-2xl p-4 ${isAvailable ? 'bg-secondary' : 'bg-secondary/50 opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-base">{flavor.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {flavor.alwaysAvailable
                        ? 'Always available'
                        : isAvailable
                          ? 'Available'
                          : 'Finished'}
                      {details ? ` · ${details}` : ''}
                    </p>
                  </div>

                  {!flavor.alwaysAvailable && isAvailable && (
                    <Button
                      onClick={() => handleFinish(flavor.id)}
                      disabled={finishingId === flavor.id}
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                    >
                      {finishingId === flavor.id ? 'Finishing...' : 'Finish'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Flavor Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <CreateFlavorModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false)
          loadFlavors()
        }}
      />
    </div>
  )
}
