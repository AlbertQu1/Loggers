'use client'

import { useEffect, useState } from 'react'
import { Cylinder } from '@/types'
import { getCylinders, changeTank } from '@/services/api/cylinders'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatLocalDate } from '@/lib/utils'
import { CreateCylinderModal } from './create-cylinder-modal'

export function TanksList() {
  const [cylinders, setCylinders] = useState<Cylinder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChanging, setIsChanging] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadCylinders = async () => {
    setIsLoading(true)
    try {
      const data = await getCylinders()
      setCylinders(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tanks'
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCylinders()
  }, [])

  const handleChangeTank = async () => {
    setIsChanging(true)
    try {
      await changeTank()
      showToast('Tank changed.', 'success')
      await loadCylinders()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to change tank.', 'error')
    } finally {
      setIsChanging(false)
    }
  }

  const activeCylinder = cylinders.find((c) => c.status === 'ACTIVE')
  const pendingCylinders = cylinders.filter((c) => c.status === 'PENDING')
  const closedCylinders = cylinders.filter((c) => c.status === 'CLOSED')

  if (isLoading) {
    return <div className="text-center py-8">Loading tanks...</div>
  }

  return (
    <div className="space-y-6">
      {/* Active Cylinder Card */}
      {activeCylinder && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-50 mb-2">
            Tank in the machine
          </h2>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-50">{activeCylinder.label}</p>
          <p className="text-sm text-blue-800 dark:text-blue-100 mt-1">
            Opened {formatLocalDate(activeCylinder.openedDate)}
          </p>
        </div>
      )}

      {/* No Active Cylinder Message */}
      {!activeCylinder && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <p className="text-sm text-amber-900 dark:text-amber-50">No tank currently in the machine.</p>
        </div>
      )}

      {/* Change Tank Button */}
      <Button
        onClick={handleChangeTank}
        disabled={isChanging || pendingCylinders.length === 0}
        className="w-full h-14 rounded-2xl text-base font-semibold"
      >
        {isChanging ? 'Changing...' : 'Change Tank'}
      </Button>
      {pendingCylinders.length === 0 && (
        <p className="text-sm text-center text-muted-foreground">
          No tanks available. Add one below before you run out.
        </p>
      )}

      {/* Pending Cylinders */}
      {pendingCylinders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pending Tanks
          </h2>
          {pendingCylinders.map((cylinder) => (
            <div key={cylinder.id} className="bg-secondary rounded-2xl p-4">
              <p className="font-semibold text-base">{cylinder.label}</p>
              <p className="text-sm text-muted-foreground">
                {cylinder.price > 0 ? `$${cylinder.price}` : 'came with the machine'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Closed Cylinders */}
      {closedCylinders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Closed Tanks
          </h2>
          {closedCylinders.map((cylinder) => (
            <div key={cylinder.id} className="bg-secondary/50 rounded-2xl p-4 opacity-60">
              <p className="font-semibold text-base">{cylinder.label}</p>
            </div>
          ))}
        </div>
      )}

      {cylinders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🛢️</div>
          <p className="text-muted-foreground font-medium">No tanks yet.</p>
        </div>
      )}

      {/* Create Cylinder Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <CreateCylinderModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false)
          loadCylinders()
        }}
      />
    </div>
  )
}
