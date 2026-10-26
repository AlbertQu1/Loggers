import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats a 'YYYY-MM-DD' date-only string for display. `new Date(str)`
// parses it as UTC midnight, and toLocaleDateString() then renders it in
// the browser's local timezone — which can shift the date back a day for
// any timezone behind UTC. Parse the components directly instead.
export function formatLocalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString()
}
