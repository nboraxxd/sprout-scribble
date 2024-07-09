import { eq } from 'drizzle-orm'
import NextAuth, { AuthError } from 'next-auth'
import Google from 'next-auth/providers/google'
import Github from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'

import { db } from '@/server'
import envConfig from '@/constants/config'
import { emailVerificationTokens, users } from '@/server/schema'
import { getEmailTokenByToken } from '@/server/actions/token.action'
import { loginByTokenSchema } from '@/lib/schema-validations/auth.schema'

class LoginByCodeError extends AuthError {
  message = 'Authentication failed'
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
      credentials: {
        token: {},
      },
      authorize: async (credentials) => {
        const loginByTokenFields = loginByTokenSchema.safeParse(credentials)

        if (credentials.token && loginByTokenFields.success) {
          const emailTokenResponse = await getEmailTokenByToken(loginByTokenFields.data.token)
          if (!emailTokenResponse.success) throw new LoginByCodeError()

          const isExpired = new Date(emailTokenResponse.data.expires) < new Date()

          if (isExpired) throw new LoginByCodeError('Email token expired')

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
  ],
})
