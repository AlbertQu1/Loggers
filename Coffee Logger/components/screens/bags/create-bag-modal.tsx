'use client'

import { useEffect, useState } from 'react'
import { createBag } from '@/services/api/bags'
import { getPurchaseLocations, PurchaseLocation } from '@/services/api/purchase-locations'
import { showToast } from '@/components/common/toast-notifications'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface CreateBagModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateBagModal({ open, onOpenChange, onSuccess }: CreateBagModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<PurchaseLocation[]>([])
  const currentYear = new Date().getFullYear()
  const [formData, setFormData] = useState({
    name: '',
    roaster: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    weight: '',
    price: '',
    gift: false,
    purchaseCityEnabled: false,
    purchaseCity: 'CDMX',
    purchaseCityCustom: '',
    notes: '',
  })

  useEffect(() => {
    getPurchaseLocations()
      .then(setLocations)
      .catch((error) => console.error('Failed to load purchase locations:', error))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const isCheckbox = type === 'checkbox'
    const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      }

      // Set price to 0 if gift is enabled
      if (name === 'gift' && newValue === true) {
        updated.price = '0'
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.weight || !formData.price) {
      showToast('Please fill in required fields', 'warning')
      return
    }

    setIsLoading(true)

    try {
      const purchaseCity = formData.purchaseCityEnabled
        ? formData.purchaseCity === 'Other'
          ? formData.purchaseCityCustom
          : formData.purchaseCity
        : 'CDMX'

      await createBag({
        name: formData.name,
        roaster: formData.roaster,
        city: purchaseCity,
        country: '',
        purchaseDate: formData.purchaseDate,
        weight: parseInt(formData.weight),
        price: parseFloat(formData.price),
        gift: formData.gift,
        notes: formData.notes,
      })

      showToast('Coffee bag created.', 'success')
      setFormData({
        name: '',
        roaster: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        weight: '',
        price: '',
        gift: false,
        purchaseCityEnabled: false,
        purchaseCity: 'CDMX',
        purchaseCityCustom: '',
        notes: '',
      })
      onSuccess()
    } catch (error) {
      showToast('Unable to connect to the server. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end animate-in">
      <div className="w-full bg-background rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Coffee Bag</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coffee Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Coffee Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Ethiopian Yirgacheffe"
              className="w-full px-4 py-3 rounded-xl border bg-secondary disabled:opacity-50"
            />
          </div>

          {/* Roaster */}
          <div>
            <label className="block text-sm font-medium mb-2">Roaster</label>
            <input
              type="text"
              name="roaster"
              value={formData.roaster}
              onChange={handleInputChange}
              placeholder="e.g., Blue Bottle"
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          {/* Purchase Date */}
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

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-2">Weight (g) *</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="250"
              className="w-full px-4 py-3 rounded-xl border bg-secondary"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="15.00"
              step="0.01"
              disabled={formData.gift}
              className="w-full px-4 py-3 rounded-xl border bg-secondary disabled:opacity-50"
            />
          </div>

          {/* Gift */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="gift"
              checked={formData.gift}
              onChange={handleInputChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">This is a gift</span>
          </label>

          {/* Purchase City Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="purchaseCityEnabled"
              checked={formData.purchaseCityEnabled}
              onChange={handleInputChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Purchase City</span>
          </label>

          {/* Purchase City Dropdown - Only show if enabled */}
          {formData.purchaseCityEnabled && (
            <div className="space-y-3 pl-7 border-l-2 border-secondary">
              <select
                name="purchaseCity"
                value={formData.purchaseCity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border bg-secondary"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {formData.purchaseCity === 'Other' && (
                <input
                  type="text"
                  name="purchaseCityCustom"
                  value={formData.purchaseCityCustom}
                  onChange={handleInputChange}
                  placeholder="Other City"
                  className="w-full px-4 py-3 rounded-xl border bg-secondary"
                />
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any notes about this coffee..."
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
              {isLoading ? 'Creating...' : 'Create Bag'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
