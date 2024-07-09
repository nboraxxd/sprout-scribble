'use server'

import bcrypt from 'bcrypt'
import { db } from '@/server'
import { eq } from 'drizzle-orm'
import { AuthError } from 'next-auth'
import { actionClient } from '@/lib/safe-action'

import { signIn } from '@/server/auth'
import { users } from '@/server/schema'
import { makeEmailToken, sendEmailToken } from '@/server/actions/token.action'
import { loginSchema, registerSchema } from '@/lib/schema-validations/auth.schema'

export const emailRegister = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput: { name, email, password } }) => {
    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) })

    if (existingUser && existingUser.emailVerified) {
      return {
        success: false,
        message: 'Email already registered',
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
    } else {
      await db.update(users).set({
        name,
        password: hashedPassword,
      })
    }

    return {
      success: true,
      message: sendEmailResponse.message,
    }
  })

export const emailLogin = actionClient.schema(loginSchema).action(async ({ parsedInput: { email, password } }) => {
  return { email, password }
})

export async function loginByEmailToken(token: string) {
  try {
    await signIn('credentials', {
      token,
      redirectTo: '/',
    })

    return {
      success: true,
      message: 'Email verified successfully',
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: error.message,
      }
    }
    throw error
  }
}
