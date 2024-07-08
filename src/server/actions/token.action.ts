'use server'

import ms from 'ms'
import { db } from '@/server'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import Mailgun, { MailgunMessageData } from 'mailgun.js'
import formData from 'form-data'

import envConfig from '@/constants/config'
import { emailVerificationTokens } from '@/server/schema'
import { EmailVerificationToken, SendVerificationEmailParams } from '@/types/token.type'
import { Response } from '@/types'

export async function getVerificationTokenByEmail(email: string): Promise<Response<EmailVerificationToken | null>> {
  try {
    const verificationToken = await db.query.emailVerificationTokens.findFirst({
      where: eq(emailVerificationTokens.email, email),
    })

    return {
      success: true,
      message: 'Get verification token successfully',
      data: verificationToken ?? null,
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error getting verification token',
    }
  }
}

export async function generateVerificationToken(email: string) {
  const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, '')
  const expires = new Date(Date.now() + ms('1h'))

  try {
    // Check if there is an existing verification token
    const response = await getVerificationTokenByEmail(email)
    if (response.success && response.data) {
      await db.update(emailVerificationTokens).set({ token, expires }).where(eq(emailVerificationTokens.email, email))
    }

    const [verificationToken] = await db
      .insert(emailVerificationTokens)
      .values({
        email,
        token,
        expires,
      })
      .returning()

    return {
      success: true,
      message: 'Generate verification token successfully',
      data: verificationToken,
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error generating verification token',
    }
  }
}

export async function sendVerificationEmail({ email, token }: SendVerificationEmailParams) {
  const mailgun = new Mailgun(formData)
  const client = mailgun.client({ username: 'api', key: envConfig.MAILGUN_API_KEY })

  const data: MailgunMessageData = {
    from: `Sprout & Scribble <no-reply@${envConfig.NEXT_PUBLIC_DOMAIN}>`,
    to: email,
    subject: 'Hello',
    template: 'sprout&scribble',
    'h:X-Mailgun-Variables': JSON.stringify({
      verification_link: `${envConfig.NEXT_PUBLIC_URL}/verify-email?token=${token}`,
    }),
  }

  await client.messages.create(envConfig.NEXT_PUBLIC_DOMAIN, data)
}
