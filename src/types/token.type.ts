import { emailVerificationTokens, twoFactorCodes } from '@/server/schema'

export type TokenInfo = typeof emailVerificationTokens.$inferSelect
export type TwoFactorCode = typeof twoFactorCodes.$inferSelect

export type SendEmailParams = {
  name: string
  email: string
  subject: string
  template: string
  variables: Record<string, string>
}
