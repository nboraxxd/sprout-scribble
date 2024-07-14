import { type DefaultSession } from 'next-auth'

export type ExtendUser = DefaultSession['user'] & {
  id: string
  name: string | null
  email: string
  image: string | null
  emailVerified: Date | null
  role: 'user' | 'admin'
  isTwoFactorEnabled: boolean
  isOAuth: boolean
  isPassword: boolean
  createdAt: Date
  updatedAt: Date
}

declare module 'next-auth' {
  interface Session {
    user: ExtendUser
  }
}
