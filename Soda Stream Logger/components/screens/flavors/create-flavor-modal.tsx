'use client'

import { useState } from 'react'
import { createFlavor } from '@/services/api/flavors'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface CreateFlavorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateFlavorModal({ open, onOpenChange, onSuccess }: CreateFlavorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    cost: '',
    ml: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      showToast('Please enter a flavor name', 'warning')
      return
    }

    setIsLoading(true)

    try {
      await createFlavor({
        name: formData.name,
        brand: formData.brand || undefined,
        cost: formData.cost ? parseInt(formData.cost) : undefined,
        ml: formData.ml ? parseInt(formData.ml) : undefined,
        purchaseDate: formData.purchaseDate,
      })

      showToast('Flavor added.', 'success')
      setFormData({
        name: '',
        brand: '',
        cost: '',
        ml: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      })
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
          <h2 className="text-2xl font-bold">New Flavor</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Flavor *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Pepino Menta"
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Everything below is optional — leave it blank for flavors with no real cost to
            track (like fresh-squeezed Limon).
          </p>

          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., SodaStream"
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cost ($)</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              placeholder="0"
              step="1"
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ml</label>
            <input
              type="number"
              name="ml"
              value={formData.ml}
              onChange={handleInputChange}
              placeholder="440"
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
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
              {isLoading ? 'Adding...' : 'Add Flavor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
