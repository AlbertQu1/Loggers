'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

let toastId = 0
const listeners: ((toast: Toast | null) => void)[] = []

export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = `toast-${toastId++}`
  const toast: Toast = { id, message, type, duration }

  listeners.forEach((listener) => listener(toast))

  if (duration > 0) {
    setTimeout(() => {
      listeners.forEach((listener) => listener(null))
    }, duration)
  }

  return id
}

export function ToastContainer() {
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    const listener = (t: Toast | null) => setToast(t)
    listeners.push(listener)

    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  }

  const colors = {
    success: 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50',
    error: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50',
    warning: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-50',
    info: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50',
  }

  const borderColors = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    warning: 'border-amber-200 dark:border-amber-800',
    info: 'border-blue-200 dark:border-blue-800',
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-sm z-50">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${colors[toast.type]} ${borderColors[toast.type]}`}
      >
        {icons[toast.type]}
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => setToast(null)}
          className="p-1 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
