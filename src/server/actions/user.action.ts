'use server'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { AuthError } from 'next-auth'

import { db, dbPool } from '@/server'
import { signIn } from '@/server/auth'
import { passwordResetTokens, users } from '@/server/schema'
import { makeEmailToken } from '@/server/actions/email-token.action'
import { makePasswordResetToken } from '@/server/actions/password-reset-token'
import { sendEmailToken, sendPasswordResetToken } from '@/utils/mailgun'
import { actionClient } from '@/lib/safe-action'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/schema-validations/auth.schema'

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

export const loginByEmail = actionClient.schema(loginSchema).action(async ({ parsedInput: { email, password } }) => {
  try {
    await signIn('login-by-email', {
      email,
      password,
      redirectTo: '/',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: error.message,
      }
    }
    throw error
  }
})

export async function loginByToken(token: string) {
  try {
    await signIn('login-by-token', {
      token,
      redirectTo: '/',
    })
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

export const forgotPassword = actionClient.schema(forgotPasswordSchema).action(async ({ parsedInput: { email } }) => {
  const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!existingUser) {
    return {
      success: false,
      message: 'Email not found',
    }
  }

  const passwordResetTokenResponse = await makePasswordResetToken(email)
  if (!passwordResetTokenResponse.success) return passwordResetTokenResponse

  const sendPasswordResetResponse = await sendPasswordResetToken({
    name: existingUser.name || 'there',
    email,
    token: passwordResetTokenResponse.data.token,
  })
  if (!sendPasswordResetResponse.success) return sendPasswordResetResponse

  return {
    success: true,
    message: sendPasswordResetResponse.message,
  }
})

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password, confirmPassword, token } }) => {
    if (password !== confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      }
    }

    if (!token) {
      return {
        success: false,
        message: 'Token not found',
      }
    }

    const existingToken = await db.query.passwordResetTokens.findFirst({ where: eq(passwordResetTokens.token, token) })
    if (!existingToken) {
      return {
        success: false,
        message: 'Token expired or invalid',
      }
    }

    const isExpired = new Date(existingToken.expires) < new Date()
    if (isExpired) {
      return {
        success: false,
        message: 'Token expired or invalid',
      }
    }

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, existingToken.email) })
    if (!existingUser) {
      return {
        success: false,
        message: 'Token expired or invalid',
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await dbPool.transaction(async (context) => {
      await context.update(users).set({ password: hashedPassword }).where(eq(users.email, existingUser.email))
      await context.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token))
    })

    return {
      success: true,
      message: 'Password reset successfully',
    }
  })
