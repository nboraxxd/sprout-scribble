import NextAuth from 'next-auth'
import google from 'next-auth/providers/google'
import github from 'next-auth/providers/github'
import { DrizzleAdapter } from '@auth/drizzle-adapter'

import envConfig from '@/constants/config'
import { db } from '@/server'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  secret: envConfig.AUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    google({
      clientId: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    github({
      clientId: envConfig.GITHUB_CLIENT_ID,
      clientSecret: envConfig.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
})
