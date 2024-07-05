import envConfig from '@/constants/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/schema.ts',
  out: './src/server/migrations',
  dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
  dbCredentials: {
    url: envConfig.POSTGRES_URL,
  },
})
