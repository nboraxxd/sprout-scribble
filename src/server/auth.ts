import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import NextAuth, { AuthError } from 'next-auth'
import Google from 'next-auth/providers/google'
import Github from 'next-auth/providers/github'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Credentials from 'next-auth/providers/credentials'

import { db } from '@/server'
import envConfig from '@/constants/config'
import { emailVerificationTokens, users } from '@/server/schema'
import { getEmailTokenByToken } from '@/server/actions/token.action'
import { loginByTokenSchema, loginSchema } from '@/lib/schema-validations/auth.schema'

class LoginByCodeError extends AuthError {
  message = 'Token expired or account not found.'
}

class LoginByEmailError extends AuthError {
  message = 'Invalid email or password.'
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  secret: envConfig.AUTH_SECRET,
  session: { strategy: 'jwt' },

  providers: [
    Google({
      clientId: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Github({
      clientId: envConfig.GITHUB_CLIENT_ID,
      clientSecret: envConfig.GITHUB_CLIENT_SECRET,
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
