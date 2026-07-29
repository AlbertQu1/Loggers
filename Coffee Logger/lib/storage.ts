import { openDB, DBSchema, IDBPDatabase } from 'idb'

export interface CoffeeLoggerDB extends DBSchema {
  syncQueue: {
    key: string
    value: {
      id: string
      method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
      endpoint: string
      data?: any
      timestamp: string
      retryCount: number
      lastError?: string
      status: 'pending' | 'in_progress' | 'failed'
    }
  }
}

let db: IDBPDatabase<CoffeeLoggerDB> | null = null

export async function getDB(): Promise<IDBPDatabase<CoffeeLoggerDB>> {
  if (db) return db

  db = await openDB<CoffeeLoggerDB>('coffee-logger-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id' })
        store.createIndex('status', 'status')
        store.createIndex('timestamp', 'timestamp')
      }
    },
  })

  return db
}

// Sync Queue Operations
export async function addToSyncQueue(item: CoffeeLoggerDB['syncQueue']['value']) {
  const db = await getDB()
  await db.put('syncQueue', item)
}

export async function getPendingItems() {
  const db = await getDB()
  return await db.getAllFromIndex('syncQueue', 'status', 'pending')
}

export async function updateSyncItemStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'failed'
) {
  const db = await getDB()
  const item = await db.get('syncQueue', id)
  if (item) {
    item.status = status
    await db.put('syncQueue', item)
  }
}

export async function removeSyncItem(id: string) {
  const db = await getDB()
  await db.delete('syncQueue', id)
}

export async function updateSyncItemError(id: string, error: string) {
  const db = await getDB()
  const item = await db.get('syncQueue', id)
  if (item) {
    item.lastError = error
    item.retryCount += 1
    await db.put('syncQueue', item)
  }
}

export async function clearSyncQueue() {
  const db = await getDB()
  await db.clear('syncQueue')
}
