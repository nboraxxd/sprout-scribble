import { z } from 'zod'
import * as dotenv from 'dotenv'

dotenv.config({
  path: '.env.local',
})

const configSchema = z.object({
  POSTGRES_URL: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  AUTH_SECRET: z.string(),
  MAILGUN_API_KEY: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_DOMAIN: z.string(),
})

const configProject = configSchema.safeParse({
  POSTGRES_URL: process.env.POSTGRES_URL,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
})

if (!configProject.success) {
  throw new Error('Invalid configuration. Please check your .env file.')
}

const envConfig = configProject.data
export default envConfig
