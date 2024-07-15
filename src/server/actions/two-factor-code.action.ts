import ms from 'ms'
import { randomInt } from 'crypto'
import { and, eq } from 'drizzle-orm'

import { Response } from '@/types'
import { TwoFactorCode } from '@/types/token.type'
import { db } from '@/server'
import { twoFactorCodes } from '@/server/schema'

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
  const getIpAddressResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/ip-address`)
  const { privateIP }: { privateIP: string | null } = await getIpAddressResponse.json()
  console.log('🔥 ~ makeTwoFactorCode ~ privateIP:', privateIP)

  const now = new Date()
  const thirtySecondsInMs = ms('30s')

  const verificationCode = randomInt(100_000, 999_999)
  const expires = new Date(Date.now() + ms('5m'))

  try {
    const findExistingPasswordToken = await getTwoFactorCodeByEmailOrIpAddress({
      ipAddress: privateIP ?? undefined,
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

    const whereClause = privateIP
      ? and(eq(twoFactorCodes.email, email), eq(twoFactorCodes.ipAddress, privateIP))
      : eq(twoFactorCodes.email, email)

    const [verificationToken] = findExistingPasswordToken.success
      ? await db
          .update(twoFactorCodes)
          .set({ code: verificationCode.toString(), expires })
          .where(whereClause)
          .returning()
      : await db
          .insert(twoFactorCodes)
          .values({ email, code: verificationCode.toString(), expires, ipAddress: privateIP })
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
