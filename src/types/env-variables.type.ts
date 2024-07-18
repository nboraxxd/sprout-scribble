/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod'

const envVariables = z.object({
  POSTGRES_URL: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  AUTH_SECRET: z.string(),
  MAILGUN_API_KEY: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  MAILGUN_DOMAIN: z.string(),
  UPLOADTHING_SECRET: z.string(),
  UPLOADTHING_APP_ID: z.string(),
  AUTH_TRUST_HOST: z.string(),
})

const envProject = envVariables.safeParse(process.env)

if (!envProject.success) {
  throw new Error('Invalid configuration. Please check your .env file.')
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
