'use server'

import ms from 'ms'
import { db } from '@/server'
import { eq } from 'drizzle-orm'
import formData from 'form-data'
import { randomUUID } from 'crypto'
import Mailgun, { MailgunMessageData } from 'mailgun.js'

import { Response } from '@/types'
import { passwordResetTokens } from '@/server/schema'
import { TokenInfo, SendResetPasswordEmailParams } from '@/types/token.type'

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

export async function sendPasswordResetToken({ name, email, token }: SendResetPasswordEmailParams) {
  try {
    const mailgun = new Mailgun(formData)
    const client = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY! })

    const data: MailgunMessageData = {
      from: `Sprout & Scribble <no-reply@${process.env.NEXT_PUBLIC_DOMAIN}>`,
      to: `${name} <${email}>`,
      subject: 'Reset your password - Sprout & Scribble',
      template: 'password_reset',
      'h:X-Mailgun-Variables': JSON.stringify({
        name,
        reset_password_link: `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`,
      }),
    }

    await client.messages.create(process.env.NEXT_PUBLIC_DOMAIN, data)

    return {
      success: true,
      message: 'Email sent successfully',
    }
  } catch (error: any) {
    return {
      success: false,
      message: (error.message || error.toString()) as string,
    }
  }
}
