export type SendVerificationEmailParams = {
  name: string
  email: string
  token: string
}

export type TokenInfo = {
  id: string
  email: string
  token: string
  expires: Date
  createdAt: Date
  updatedAt: Date
}

export type SendResetPasswordEmailParams = SendVerificationEmailParams
