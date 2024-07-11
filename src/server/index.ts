import * as schema from '@/server/schema'
import { neon, Pool } from '@neondatabase/serverless'
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless'

import envConfig from '@/constants/config'

const sql = neon(envConfig.POSTGRES_URL)
export const db = drizzleHttp(sql, { schema, logger: true })

const pool = new Pool({ connectionString: envConfig.POSTGRES_URL })
export const dbPool = drizzleServerless(pool)
