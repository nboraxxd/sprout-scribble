'use server'

import ms from 'ms'
import { db } from '@/server'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

import { Response } from '@/types'
import { passwordResetTokens } from '@/server/schema'
import { TokenInfo } from '@/types/token.type'

export async function getPasswordResetTokenByEmail(email: string): Promise<Response<TokenInfo>> {
  const passwordResetToken = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.email, email),
  })

  if (!passwordResetToken) {
    return {
      success: false,
      message: 'Email token not found',
    }
  }

  return {
    success: true,
    message: 'Get email token successfully',
    data: passwordResetToken,
  }
}

export async function makePasswordResetToken(email: string): Promise<Response<TokenInfo>> {
  const now = new Date()
  const oneMinuteInMs = ms('1m')

  const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, '')
  const expires = new Date(Date.now() + ms('1h'))

  try {
    const findExistingPasswordToken = await getPasswordResetTokenByEmail(email)

    if (
      findExistingPasswordToken.success &&
      now.getTime() - new Date(findExistingPasswordToken.data.updatedAt).getTime() < oneMinuteInMs
    ) {
      const remainingTimeInMs =
        oneMinuteInMs - (now.getTime() - new Date(findExistingPasswordToken.data.updatedAt).getTime())
      const remainingTimeInSec = Math.ceil(remainingTimeInMs / 1000)

      return {
        success: false,
        message: `Please try again in ${remainingTimeInSec} seconds`,
      }
    }

    const [verificationToken] = findExistingPasswordToken.success
      ? await db
          .update(passwordResetTokens)
          .set({ token, expires })
          .where(eq(passwordResetTokens.email, email))
          .returning()
      : await db.insert(passwordResetTokens).values({ email, token, expires }).returning()

    return {
      success: true,
      message: 'Make password reset token successfully',
      data: verificationToken,
    }
  } catch (error: any) {
    return {
      success: false,
      message: (error.message || error.toString()) as string,
    }
  }
}
