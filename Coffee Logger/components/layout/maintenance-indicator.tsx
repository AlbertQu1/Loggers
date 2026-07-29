'use client'

import Link from 'next/link'
import { useMaintenanceStatus } from '@/hooks/use-maintenance-status'

export function MaintenanceIndicator() {
  const { needsClean, needsDescale } = useMaintenanceStatus(30000)

  if (!needsClean && !needsDescale) {
    return null
  }

  const label = [needsClean && 'Clean', needsDescale && 'Descale'].filter(Boolean).join(' · ')

  return (
    <Link href="/waste" className="flex items-center gap-1.5 px-2 py-1" title={`Needs: ${label}`}>
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-medium text-red-600 dark:text-red-400">{label}</span>
    </Link>
  )
}
