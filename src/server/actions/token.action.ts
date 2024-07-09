'use server'

import ms from 'ms'
import { db } from '@/server'
import { eq } from 'drizzle-orm'
import formData from 'form-data'
import { randomUUID } from 'crypto'
import Mailgun, { MailgunMessageData } from 'mailgun.js'

import envConfig from '@/constants/config'
import { emailVerificationTokens } from '@/server/schema'
import { EmailVerificationToken, SendVerificationEmailParams } from '@/types/token.type'
import { Response } from '@/types'

export async function getEmailTokenByEmail(email: string): Promise<Response<EmailVerificationToken | null>> {
  const verificationToken = await db.query.emailVerificationTokens.findFirst({
    where: eq(emailVerificationTokens.email, email),
  })

  return {
    success: true,
    message: 'Get verification token successfully',
    data: verificationToken ?? null,
  }
}

export async function makeEmailToken(email: string): Promise<Response<EmailVerificationToken>> {
  const now = new Date()
  const oneMinuteInMs = ms('1m')

  const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, '')
  const expires = new Date(Date.now() + ms('1h'))

  try {
    const emailTokenResponse = await getEmailTokenByEmail(email)

    if (
      emailTokenResponse.success &&
      emailTokenResponse.data &&
      now.getTime() - new Date(emailTokenResponse.data.updatedAt).getTime() < oneMinuteInMs
    ) {
      const remainingTimeInMs = oneMinuteInMs - (now.getTime() - new Date(emailTokenResponse.data.updatedAt).getTime())
      const remainingTimeInSec = Math.ceil(remainingTimeInMs / 1000)

      return {
        success: false,
        message: `Please try again in ${remainingTimeInSec} seconds`,
      }
    }

    const [verificationToken] =
      emailTokenResponse.success && emailTokenResponse.data
        ? await db
            .update(emailVerificationTokens)
            .set({ token, expires })
            .where(eq(emailVerificationTokens.email, email))
            .returning()
        : await db.insert(emailVerificationTokens).values({ email, token, expires }).returning()

    return {
      success: true,
      message: 'Make email token successfully',
      data: verificationToken,
    }
  } catch (error: any) {
    return {
      success: false,
      message: (error.message || error.toString()) as string,
    }
  }
}

export async function sendEmailToken({ name, email, token }: SendVerificationEmailParams) {
  try {
    const mailgun = new Mailgun(formData)
    const client = mailgun.client({ username: 'api', key: envConfig.MAILGUN_API_KEY })

    const data: MailgunMessageData = {
      from: `Sprout & Scribble <no-reply@${envConfig.NEXT_PUBLIC_DOMAIN}>`,
      to: `${name} <${email}>`,
      subject: 'Verify your email - Sprout & Scribble',
      template: 'email_verification',
      'h:X-Mailgun-Variables': JSON.stringify({
        verification_link: `${envConfig.NEXT_PUBLIC_URL}/auth/verify-email?token=${token}`,
      }),
    }

    await client.messages.create(envConfig.NEXT_PUBLIC_DOMAIN, data)

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
