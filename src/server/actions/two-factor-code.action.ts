'use server'

import ms from 'ms'
import { randomInt } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'

import { Response } from '@/types'
import { TwoFactorCode } from '@/types/token.type'
import { sendEmail } from '@/utils/mailgun'
import { EMAIL_TEMPLATES } from '@/constants/email-templates'
import { db } from '@/server'
import { twoFactorCodes } from '@/server/schema'
import { actionClient } from '@/lib/safe-action'
import { twoFactorCodeSchema } from '@/lib/schema-validations/common.schema'

export async function getTwoFactorCodeByEmailOrIpAddress({
  email,
  ipAddress,
}: {
  ipAddress?: string
  email: string
}): Promise<Response<TwoFactorCode>> {
  const twoFactorCode = await db.query.twoFactorCodes.findFirst({
    where: ipAddress
      ? (twoFactorCodes, { eq }) => and(eq(twoFactorCodes.email, email), eq(twoFactorCodes.ipAddress, ipAddress))
      : (twoFactorCodes, { eq }) => eq(twoFactorCodes.email, email),
  })

  if (!twoFactorCode) {
    return {
      success: false,
      message: 'Two factor code not found',
    }
  }

  return {
    success: true,
    message: 'Get two factor code successfully',
    data: twoFactorCode,
  }
}

export async function makeTwoFactorCode(email: string): Promise<Response<TwoFactorCode>> {
  const headersList = headers()
  const ipAddress = headersList.get('request-ip')

  const now = new Date()
  const thirtySecondsInMs = ms('30s')

  const verificationCode = randomInt(100_000, 999_999)
  const expires = new Date(Date.now() + ms('5m'))

  try {
    const findExistingPasswordToken = await getTwoFactorCodeByEmailOrIpAddress({
      ipAddress: ipAddress ?? undefined,
      email,
    })

    if (
      findExistingPasswordToken.success &&
      now.getTime() - new Date(findExistingPasswordToken.data.updatedAt).getTime() < thirtySecondsInMs
    ) {
      const remainingTimeInMs =
        thirtySecondsInMs - (now.getTime() - new Date(findExistingPasswordToken.data.updatedAt).getTime())
      const remainingTimeInSec = Math.ceil(remainingTimeInMs / 1000)

      return {
        success: false,
        message: `Please try again in ${remainingTimeInSec} seconds`,
      }
    }

    const whereClause = ipAddress
      ? and(eq(twoFactorCodes.email, email), eq(twoFactorCodes.ipAddress, ipAddress))
      : eq(twoFactorCodes.email, email)

    const [verificationToken] = findExistingPasswordToken.success
      ? await db
          .update(twoFactorCodes)
          .set({ code: verificationCode.toString(), expires })
          .where(whereClause)
          .returning()
      : await db
          .insert(twoFactorCodes)
          .values({ email, code: verificationCode.toString(), expires, ipAddress })
          .returning()

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

export async function makeAndSendTwoFactorCode({ email, name }: { email: string; name?: string }) {
  const twoFactorCodeResponse = await makeTwoFactorCode(email)
  if (twoFactorCodeResponse.success === false) return twoFactorCodeResponse

  const response = await sendEmail({
    name: name || 'there',
    email,
    subject: 'Login verification code - Sprout & Scribble',
    html: EMAIL_TEMPLATES.TWO_FACTOR({ code: twoFactorCodeResponse.data.code, name: name || 'there' }),
  })
  if (response.success === false) {
    return {
      success: false,
      message: response.message,
    }
  }

  return {
    success: true,
    message: 'Verification code sent',
    data: {
      id: twoFactorCodeResponse.data.id,
      email: twoFactorCodeResponse.data.email,
      name,
    },
  }
}

export const resendTwoFactorCode = actionClient
  .schema(twoFactorCodeSchema)
  .action(async ({ parsedInput: { email, name } }) => {
    return makeAndSendTwoFactorCode({ email, name })
  })
