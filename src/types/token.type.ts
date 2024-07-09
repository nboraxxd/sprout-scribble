export type SendVerificationEmailParams = {
  name: string
  email: string
  token: string
}

export type EmailVerificationToken = {
  id: string
  email: string
  token: string
  expires: Date
  createdAt: Date
  updatedAt: Date
}
