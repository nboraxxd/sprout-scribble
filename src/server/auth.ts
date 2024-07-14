import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import NextAuth, { AuthError } from 'next-auth'
import Google from 'next-auth/providers/google'
import Github from 'next-auth/providers/github'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Credentials from 'next-auth/providers/credentials'

import { db } from '@/server'
import { accounts, emailVerificationTokens, users } from '@/server/schema'
import { getEmailTokenByToken } from '@/server/actions/email-token.action'
import { loginByTokenSchema, loginSchema } from '@/lib/schema-validations/auth.schema'

class LoginByCodeError extends AuthError {
  message = 'Token expired or invalid'
}

class LoginByEmailError extends AuthError {
  message = 'Invalid email or password'
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (session && token.sub) {
        session.user.id = token.sub
      }

      if (session.user) {
        session.user.name = token.name as string | null
        session.user.email = token.email as string
        session.user.image = token.image as string | null
        session.user.emailVerified = token.emailVerified as Date | null
        session.user.role = token.role as 'user' | 'admin'
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.isOAuth = token.isOAuth as boolean
        session.user.hasPassword = token.isPassword as boolean
        session.user.createdAt = token.createdAt as Date
        session.user.updatedAt = token.updatedAt as Date
      }

      return session
    },

    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await db.query.users.findFirst({ where: eq(users.id, token.sub) })
      if (!existingUser) return token

      const existingAccount = await db.query.accounts.findFirst({ where: eq(accounts.userId, token.sub) })

      token.name = existingUser.name
      token.email = existingUser.email
      token.image = existingUser.image
      token.emailVerified = existingUser.emailVerified
      token.role = existingUser.role
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
      token.isOAuth = !!existingAccount
      token.isPassword = !!existingUser.password
      token.createdAt = existingUser.createdAt
      token.updatedAt = existingUser.updatedAt

      return token
    },
  },
  events: {
    linkAccount: async ({ user }) => {
      if (!user.id) return
      await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id))
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: 'login-by-token',
      credentials: {
        token: {},
      },
      authorize: async (credentials) => {
        const loginByTokenFields = loginByTokenSchema.safeParse(credentials)

        if (credentials.token && loginByTokenFields.success) {
          const emailTokenResponse = await getEmailTokenByToken(loginByTokenFields.data.token)
          if (!emailTokenResponse.success) throw new LoginByCodeError()

          const isExpired = new Date(emailTokenResponse.data.expires) < new Date()

          if (isExpired) throw new LoginByCodeError()

          const existingUser = await db.query.users.findFirst({ where: eq(users.email, emailTokenResponse.data.email) })

          if (!existingUser) throw new LoginByCodeError()

          const [[userResponse]] = await Promise.all([
            db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, existingUser.email)).returning({
              id: users.id,
              name: users.name,
              email: users.email,
              emailVerified: users.emailVerified,
              role: users.role,
            }),
            db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, emailTokenResponse.data.id)),
          ])

          return userResponse
        }

        return null
      },
    }),
    Credentials({
      id: 'login-by-email',
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const loginByEmailFields = loginSchema.safeParse(credentials)

        if (loginByEmailFields.success) {
          const { email, password } = loginByEmailFields.data

          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          })

          if (!user || !user.password) throw new LoginByEmailError()

          const isValid = await bcrypt.compare(password, user.password)

          if (!isValid) throw new LoginByEmailError()

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            role: user.role,
          }
        }

        return null
      },
    }),
  ],
})
