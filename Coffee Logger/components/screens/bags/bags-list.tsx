'use client'

import { useEffect, useState } from 'react'
import { CoffeeBag } from '@/types'
import { getBags, finishBag, openBag } from '@/services/api/bags'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { CreateBagModal } from './create-bag-modal'
import { formatLocalDate } from '@/lib/utils'

export function BagsList() {
  const [bags, setBags] = useState<CoffeeBag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [expandedBag, setExpandedBag] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [confirmFinishBagId, setConfirmFinishBagId] = useState<string | null>(null)

  const loadBags = async () => {
    setIsLoading(true)
    try {
      const data = await getBags()
      setBags(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load bags'
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBags()
  }, [])

  const handleOpenBag = async (bagId: string) => {
    // Check if already has active bag
    const activeBag = bags.find((b) => b.status === 'ACTIVE')
    if (activeBag) {
      showToast('An active bag already exists. Finish it first.', 'warning')
      return
    }

    setIsActionLoading(bagId)
    try {
      await openBag(bagId)
      showToast('Coffee bag opened.', 'success')
      await loadBags()
    } catch (error) {
      showToast('Unable to connect to the server. Please try again.', 'error')
    } finally {
      setIsActionLoading(null)
    }
  }

  const handleFinishBag = async (bagId: string) => {
    setIsActionLoading(bagId)
    try {
      await finishBag(bagId)
      showToast('Coffee bag finished.', 'success')
      setConfirmFinishBagId(null)
      await loadBags()
    } catch (error) {
      showToast('Unable to connect to the server. Please try again.', 'error')
    } finally {
      setIsActionLoading(null)
    }
  }

  const activeBag = bags.find((b) => b.status === 'ACTIVE')
  const pendingBags = bags.filter((b) => b.status === 'PENDING')
  const closedBags = bags.filter((b) => b.status === 'CLOSED')

  if (isLoading) {
    return <div className="text-center py-8">Loading bags...</div>
  }

  return (
    <div className="space-y-6">
      {/* Active Bag Card */}
      {activeBag && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-green-900 dark:text-green-50 mb-4">
            Coffee currently in the machine
          </h2>
          <div className="space-y-2 mb-4">
            <p className="text-lg font-bold text-green-900 dark:text-green-50">{activeBag.name}</p>
            {activeBag.roaster && (
              <p className="text-sm text-green-800 dark:text-green-100">
                {activeBag.roaster}
              </p>
            )}
            {activeBag.origin && (
              <p className="text-sm text-green-800 dark:text-green-100">
                {activeBag.origin}
              </p>
            )}
            {activeBag.openedDate && (
              <p className="text-sm text-green-800 dark:text-green-100">
                Opened {formatLocalDate(activeBag.openedDate)}
              </p>
            )}
            {activeBag.weight && (
              <p className="text-sm text-green-800 dark:text-green-100">
                {activeBag.weight}g
              </p>
            )}
          </div>
          <Button
            onClick={() => setConfirmFinishBagId(activeBag.id)}
            disabled={isActionLoading === activeBag.id}
            variant="destructive"
            className="w-full rounded-xl"
          >
            Finish Coffee Bag
          </Button>
        </div>
      )}

      {/* Finish Confirmation Dialog */}
      {confirmFinishBagId && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-background rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div>
              <h2 className="text-xl font-bold mb-2">Finish Coffee Bag?</h2>
              <p className="text-sm text-muted-foreground">
                This will close the current coffee bag. Future cups will automatically be registered as Ground Coffee until another coffee bag is opened.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmFinishBagId(null)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleFinishBag(confirmFinishBagId)}
                disabled={isActionLoading === confirmFinishBagId}
                variant="destructive"
                className="flex-1 rounded-xl"
              >
                {isActionLoading === confirmFinishBagId ? 'Finishing...' : 'Finish'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Bags */}
      {pendingBags.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pending Coffee Bags
          </h2>
          {pendingBags.map((bag) => (
            <div
              key={bag.id}
              className="bg-secondary rounded-2xl p-4 space-y-3"
              onClick={() => setExpandedBag(expandedBag === bag.id ? null : bag.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">{bag.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {bag.roaster} — {bag.city}, {bag.country}
                  </p>
                </div>
                <button className="ml-2 p-1">
                  {expandedBag === bag.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedBag === bag.id && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">{bag.weight}g</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium">${bag.price}</p>
                    </div>
                  </div>

                  {bag.notes && (
                    <div>
                      <p className="text-muted-foreground text-sm">Notes</p>
                      <p className="text-sm">{bag.notes}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleOpenBag(bag.id)}
                    disabled={isActionLoading === bag.id}
                    className="w-full"
                  >
                    {isActionLoading === bag.id ? 'Opening...' : 'Open Bag'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Closed Bags */}
      {closedBags.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Closed Bags
          </h2>
          {closedBags.map((bag) => (
            <div key={bag.id} className="bg-secondary/50 rounded-2xl p-4 opacity-60">
              <p className="font-semibold text-base">{bag.name}</p>
              {bag.roaster && (
                <p className="text-sm text-muted-foreground">
                  {bag.roaster}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingBags.length === 0 && !activeBag && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-muted-foreground font-medium">No pending coffee bags.</p>
        </div>
      )}

      {/* Create Bag Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Create Bag Modal */}
      <CreateBagModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false)
          loadBags()
        }}
      />
    </div>
  )
}
