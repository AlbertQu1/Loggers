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

  const acento = {
    success: 'text-emerald-400 dark:text-emerald-600',
    error: 'text-red-400 dark:text-red-600',
    warning: 'text-amber-400 dark:text-amber-600',
    info: 'text-accent',
  }

  return (
    <div className="fixed inset-x-4 bottom-28 z-50 mx-auto max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-primary-foreground shadow-xl">
        <span className={acento[toast.type]}>{icons[toast.type]}</span>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button onClick={() => setToast(null)} className="p-1 opacity-70 transition-opacity hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
