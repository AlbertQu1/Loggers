'use client'

import { useEffect, useState } from 'react'
import { createCylinders, getCylinders } from '@/services/api/cylinders'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const MAX_QUANTITY = 5

interface CreateCylinderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateCylinderModal({ open, onOpenChange, onSuccess }: CreateCylinderModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(2)
  const [formData, setFormData] = useState({
    price: '',
    notes: '',
  })

  // Prefill price from the most recently added cylinder — it barely
  // changes, so this speeds up entry.
  useEffect(() => {
    if (!open) return
    getCylinders()
      .then((cylinders) => {
        if (cylinders.length === 0) return
        setFormData((prev) => ({ ...prev, price: String(cylinders[0].price) }))
      })
      .catch((error) => console.error('Failed to load last cylinder defaults:', error))
  }, [open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      const created = await createCylinders({
        price: parseInt(formData.price) || 0,
        notes: formData.notes,
        quantity,
      })

      showToast(
        created.length > 1 ? `${created.length} tanks created.` : 'Tank created.',
        'success'
      )
      setQuantity(2)
      setFormData((prev) => ({ ...prev, notes: '' }))
      onSuccess()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to connect to the server.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end animate-in">
      <div className="w-full bg-background rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Tank</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center justify-center gap-6 bg-secondary rounded-2xl p-6">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-14 rounded-2xl bg-foreground text-background font-bold text-xl hover:opacity-90 transition-opacity"
              >
                −
              </button>
              <span className="text-4xl font-bold min-w-16 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))}
                className="w-14 h-14 rounded-2xl bg-foreground text-background font-bold text-xl hover:opacity-90 transition-opacity"
              >
                +
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Max {MAX_QUANTITY} at a time — tank labels are assigned automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price ($, each)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0 if it came with the machine"
              step="1"
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any notes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border bg-secondary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : `Create ${quantity > 1 ? `${quantity} Tanks` : 'Tank'}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
