export type UserLogin = {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  role: 'user' | 'admin' | null
}
