import * as schema from '@/server/schema'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'

type SuccessResponse<Data> = {
  success: true
  message: string
  data: Data
}

type ErrorResponse = {
  success: false
  message: string
}

export type MessageResponse = {
  success: boolean
  message: string
}

export type Response<Data> = SuccessResponse<Data> | ErrorResponse

export type Tables = NeonHttpDatabase<typeof schema>['query']
