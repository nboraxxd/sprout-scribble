'use server'

import bcrypt from 'bcryptjs'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'
import { eq } from 'drizzle-orm'
import { AuthError } from 'next-auth'
import { revalidatePath } from 'next/cache'

import { sendEmail } from '@/utils/mailgun'
import { EMAIL_TEMPLATES } from '@/constants/email-templates'
import { db, dbPool } from '@/server'
import { auth, signIn } from '@/server/auth'
import { passwordResetTokens, users } from '@/server/schema'
import { makeAndSendEmailToken } from '@/server/actions/email-token.action'
import { makeAndSendTwoFactorCode } from '@/server/actions/two-factor-code.action'
import { makePasswordResetToken } from '@/server/actions/password-reset-token'
import { actionClient } from '@/lib/safe-action'
import { updateProfileSchema } from '@/lib/schema-validations/profile.schema'
import {
  forgotPasswordSchema,
  loginByCodeSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/schema-validations/auth.schema'

export const emailRegister = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput: { name, email, password } }) => {
    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) })

    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered',
      }
    }

    const makeAndSendEmailResponse = await makeAndSendEmailToken({ email, name })
    if (!makeAndSendEmailResponse.success) return makeAndSendEmailResponse

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    })

    return {
      success: true,
      message: makeAndSendEmailResponse.message,
    }
  })

export const loginByEmail = actionClient.schema(loginSchema).action(async ({ parsedInput: { email, password } }) => {
  const emailLoginError: { success: false; message: string } = {
    success: false,
    message: 'Invalid email or password',
  }

  try {
    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) })

    if (!existingUser || !existingUser.password) {
      return emailLoginError
    }

    if (existingUser.isTwoFactorEnabled) {
      const isValid = await bcrypt.compare(password, existingUser.password)
      if (!isValid) {
        return emailLoginError
      }

      return makeAndSendTwoFactorCode({ email, name: existingUser.name ?? undefined })
    } else {
      await signIn('login-by-email', {
        email,
        password,
        redirectTo: '/',
      })
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

export const loginByCode = actionClient
  .schema(loginByCodeSchema)
  .action(async ({ parsedInput: { code, email, id } }) => {
    try {
      await signIn('login-by-code', {
        code,
        email,
        id,
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

  const sendPasswordResetResponse = await sendEmail({
    name: existingUser.name || 'there',
    email,
    subject: 'Reset your password - Sprout & Scribble',
    html: EMAIL_TEMPLATES.PASSWORD_RESET({
      name: existingUser.name || 'there',
      link: `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${passwordResetTokenResponse.data.token}`,
    }),
  })
  if (!sendPasswordResetResponse.success) return sendPasswordResetResponse

  return {
    success: true,
    message: sendPasswordResetResponse.message,
  }
})

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password, token } }) => {
    const tokenError = {
      success: false,
      message: 'Token expired or invalid',
    } as const

    if (!token) {
      return {
        success: false,
        message: 'Token not found',
      } as const
    }

    const existingToken = await db.query.passwordResetTokens.findFirst({ where: eq(passwordResetTokens.token, token) })
    if (!existingToken) {
      return tokenError
    }

    const isExpired = new Date(existingToken.expires) < new Date()
    if (isExpired) {
      return tokenError
    }

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, existingToken.email) })
    if (!existingUser) {
      return tokenError
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

export const updateProfile = actionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput: { name, password, newPassword, image, isTwoFactorEnabled, oAuthPassword } }) => {
    const session = await auth()
    if (!session) {
      return {
        success: false,
        message: 'Unauthorized',
      }
    }

    const dbUser = await db.query.users.findFirst({ where: eq(users.id, session.user.id) })
    if (!dbUser) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    if (newPassword && oAuthPassword) {
      return {
        success: false,
        message: 'Cannot change password and OAuth password at the same time',
      }
    }

    if (password && dbUser.password && !bcrypt.compareSync(password, dbUser.password)) {
      return {
        success: false,
        message: 'Current password is incorrect',
      }
    }

    let hashedPassword: string | undefined
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, 10)
    } else if (oAuthPassword) {
      hashedPassword = await bcrypt.hash(oAuthPassword, 10)
    }

    await db
      .update(users)
      .set(omitBy({ name, password: hashedPassword, image, isTwoFactorEnabled }, isUndefined))
      .where(eq(users.id, session.user.id))

    revalidatePath('/dashboard/profile', 'page')

    return {
      success: true,
      message: 'Profile updated successfully',
    }
  })
