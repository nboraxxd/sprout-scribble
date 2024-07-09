'use server'

import { db } from '@/server'
import { eq } from 'drizzle-orm'
import { actionClient } from '@/lib/safe-action'
import bcrypt from 'bcrypt'

import { users } from '@/server/schema'
import { loginSchema, registerSchema } from '@/lib/schema-validations/auth.schema'
import { makeEmailToken, sendEmailToken } from '@/server/actions/token.action'

export const emailRegister = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput: { name, email, password } }) => {
    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) })

    if (existingUser && existingUser.emailVerified) {
      return {
        success: false,
        message: 'User already exists',
      }
    }

    const emailTokenResponse = await makeEmailToken(email)
    if (!emailTokenResponse.success) return emailTokenResponse

    const sendEmailResponse = await sendEmailToken({
      name,
      email,
      token: emailTokenResponse.data.token,
    })
    if (!sendEmailResponse.success) return sendEmailResponse

    if (!existingUser) {
      await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
      })
    }

    return {
      success: true,
      message: existingUser?.emailVerified ? 'Email verification token resent' : sendEmailResponse.message,
    }
  })

export const emailLogin = actionClient.schema(loginSchema).action(async ({ parsedInput: { email, password } }) => {
  return { email, password }
})
