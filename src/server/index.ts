import * as schema from '@/server/schema'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import envConfig from '@/constants/config'

const sql = neon(envConfig.POSTGRES_URL)
export const db = drizzle(sql, { schema, logger: true })
