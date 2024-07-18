import * as schema from '@/server/schema'
import { neon, Pool } from '@neondatabase/serverless'
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless'

const sql = neon(process.env.POSTGRES_URL)
export const db = drizzleHttp(sql, { schema, logger: false })

const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
export const dbPool = drizzleServerless(pool)
