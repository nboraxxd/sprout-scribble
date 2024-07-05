import { z } from 'zod'
import * as dotenv from 'dotenv'

dotenv.config({
  path: '.env.local',
})

const configSchema = z.object({
  POSTGRES_URL: z.string(),
})

const configProject = configSchema.safeParse({
  POSTGRES_URL: process.env.POSTGRES_URL,
})

if (!configProject.success) {
  throw new Error('Invalid configuration. Please check your .env file.')
}

const envConfig = configProject.data
export default envConfig
