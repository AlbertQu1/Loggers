// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Health Status
export interface HealthStatus {
  status: 'connected' | 'offline'
  timestamp: string
}

// Cylinder (CO2 tank) Types
export interface Cylinder {
  id: string
  label: string
  price: number
  purchaseDate: string
  notes: string
  openedDate: string | null
  finishedDate: string | null
  status: 'PENDING' | 'ACTIVE' | 'CLOSED'
}

// Preparation (soda serving) Types
export interface Preparation {
  id: string
  cylinderId: string
  shotsLight: number
  shotsMedium: number
  shotsStrong: number
  bottlesPrepared: number
  flavorId?: string
  timestamp: string
  createdAt: string
}

// Flavor Types — one row per purchase (same pattern as coffee_bags); a
// flavor with always_available=true (e.g. Limon) never needs a purchase
// entry to stay selectable.
export interface Flavor {
  id: string
  name: string
  brand: string | null
  cost: number | null
  ml: number | null
  purchaseDate: string | null
  finishedDate: string | null
  alwaysAvailable: boolean
}
