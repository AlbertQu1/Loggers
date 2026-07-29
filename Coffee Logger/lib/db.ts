import { Pool } from 'pg'

const globalForPool = globalThis as unknown as { pgPool?: Pool }

const pool =
  globalForPool.pgPool ??
  new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: 5,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pgPool = pool
}

export default pool