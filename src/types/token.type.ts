export type TokenInfo = {
  id: string
  email: string
  token: string
  expires: Date
  createdAt: Date
  updatedAt: Date
}

export type SendEmail = {
  name: string
  email: string
  subject: string
  template: string
  variables: Record<string, string>
}
