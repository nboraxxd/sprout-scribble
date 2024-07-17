'use server'

import ms from 'ms'
import { db } from '@/server'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

import { MessageResponse, Response } from '@/types'
import { TokenInfo } from '@/types/token.type'
import { emailVerificationTokens } from '@/server/schema'
import { actionClient } from '@/lib/safe-action'
import { resendTokenOrCodeSchema } from '@/lib/schema-validations/common.schema'
import { sendEmail } from '@/utils/mailgun'
import { EMAIL_TEMPLATES } from '@/constants/email-templates'

export async function getEmailTokenByEmail(email: string): Promise<Response<TokenInfo>> {
  const verificationToken = await db.query.emailVerificationTokens.findFirst({
    where: eq(emailVerificationTokens.email, email),
  })

  if (!verificationToken) {
    return {
      success: false,
      message: 'Email token not found',
    }
  }

  return {
    success: true,
    message: 'Get email token successfully',
    data: verificationToken,
  }
}

export async function makeEmailToken(email: string): Promise<Response<TokenInfo>> {
  const now = new Date()
  const oneMinuteInMs = ms('1m')

  const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, '')
  const expires = new Date(Date.now() + ms('1h'))

  try {
    const findExistingEmailToken = await getEmailTokenByEmail(email)

    if (
      findExistingEmailToken.success &&
      now.getTime() - new Date(findExistingEmailToken.data.updatedAt).getTime() < oneMinuteInMs
    ) {
      const remainingTimeInMs =
        oneMinuteInMs - (now.getTime() - new Date(findExistingEmailToken.data.updatedAt).getTime())
      const remainingTimeInSec = Math.ceil(remainingTimeInMs / 1000)

      return {
        success: false,
        message: `Please try again in ${remainingTimeInSec} seconds`,
      }
    }

    const [verificationToken] = findExistingEmailToken.success
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

export async function makeAndSendEmailToken({
  email,
  name,
}: {
  email: string
  name: string
}): Promise<MessageResponse> {
  const emailTokenResponse = await makeEmailToken(email)
  if (!emailTokenResponse.success) return emailTokenResponse

  const sendEmailResponse = await sendEmail({
    name,
    email,
    subject: 'Verify your email - Sprout & Scribble',
    html: EMAIL_TEMPLATES.EMAIL_VERIFICATION({
      name,
      link: `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${emailTokenResponse.data.token}`,
    }),
  })
  if (!sendEmailResponse.success) return sendEmailResponse

  return {
    success: true,
    message: sendEmailResponse.message,
  }
}

export const resendEmailToken = actionClient
  .schema(resendTokenOrCodeSchema)
  .action(async ({ parsedInput: { email, name } }) => {
    return makeAndSendEmailToken({ email, name: name || 'there' })
  })
