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

// Coffee Bag Types
export interface CoffeeBag {
  id: string
  name: string
  roaster: string
  city: string
  country: string
  origin?: string
  purchaseDate: string
  weight: number // grams
  price: number
  gift: boolean
  notes: string
  openedDate: string | null
  finishedDate: string | null
  status: 'PENDING' | 'ACTIVE' | 'CLOSED'
  createdAt: string
  updatedAt: string
}

// Cup Entry Types
export type CupSize = 
  | 'double'
  | 'quad'
  | '6oz'
  | '8oz'
  | '10oz'
  | '12oz'
  | '14oz'
  | '16oz'
  | '18oz'

export interface Cup {
  id: string
  size: CupSize
  cups_prepared: number
  cold: boolean
  withMilk: boolean
  useGroundCoffee: boolean
  activeBagId?: string
  contains_alcohol: boolean
  alcohol_types?: string[]
  contains_flavor: boolean
  flavors?: string[]
  timestamp: string
  createdAt: string
  updatedAt: string
}

// Waste Entry Types
export interface WasteEntry {
  id: string
  coffeeBagId: string
  date: string
  grams: number
  reason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// History Entry (combined view)
export interface HistoryEntry {
  id: string
  type: 'cup' | 'waste' | 'bag_opened' | 'bag_finished'
  timestamp: string
  data: any
}

// Maintenance Types
export type MaintenanceType = 'CLEAN' | 'DESCALE'

export interface MaintenanceRecord {
  id: string
  maintenanceType: MaintenanceType
  date: string
  notes?: string
  createdAt: string
}

export interface MaintenanceStatus {
  cupsSinceClean: number
  cupsSinceDescale: number
  needsClean: boolean
  needsDescale: boolean
  lastCleanDate: string | null
  lastDescaleDate: string | null
}

// Cafeteria Benchmark Types (feeds coffee_WIP.py's price benchmark, not
// used by the app's own features)
export interface CafeteriaBenchmark {
  id: string
  year: number
  cafeteriaName: string
  city: string
  price: number
  createdAt: string
}

// Sync Queue Types
export interface SyncQueueItem {
  id: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  endpoint: string
  data?: any
  timestamp: string
  retryCount: number
  lastError?: string
  status: 'pending' | 'in_progress' | 'failed'
}

// Filter Query Types
export interface HistoryFilters {
  startDate?: string
  endDate?: string
  bagId?: string
  groundCoffeeOnly?: boolean
  coldCoffeeOnly?: boolean
  withMilkOnly?: boolean
  alcoholOnly?: boolean
}
