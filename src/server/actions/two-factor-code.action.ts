import { Response } from '@/types'
import { TwoFactorCode } from '@/types/token.type'
import { db } from '@/server'
import { and } from 'drizzle-orm'

export async function getTwoFactorCodeByEmailAndId({
  email,
  id,
}: {
  id: string
  email: string
}): Promise<Response<TwoFactorCode>> {
  const twoFactorCode = await db.query.twoFactorCodes.findFirst({
    where: (twoFactorCodes, { eq }) => and(eq(twoFactorCodes.email, email), eq(twoFactorCodes.id, id)),
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

// export async function makeTwoFactorCode(email: string): Promise<Response<TwoFactorCode>> {
//   const now = new Date()
//   const oneMinuteInMs = ms('1m')

//   const verificationCode = randomInt(100_000, 999_999)
//   const expires = new Date(Date.now() + ms('1h'))

//   try {
//     const findExistingPasswordToken = await getTwoFactorCodeByEmailAndId({ id, email })

//     if (
//       findExistingPasswordToken.success &&
//       now.getTime() - new Date(findExistingPasswordToken.data.updatedAt).getTime() < oneMinuteInMs
//     ) {
//       const remainingTimeInMs =
//         oneMinuteInMs - (now.getTime() - new Date(findExistingPasswordToken.data.updatedAt).getTime())
//       const remainingTimeInSec = Math.ceil(remainingTimeInMs / 1000)

//       return {
//         success: false,
//         message: `Please try again in ${remainingTimeInSec} seconds`,
//       }
//     }

//     const [verificationToken] = findExistingPasswordToken.success
//       ? await db
//           .update(passwordResetTokens)
//           .set({ token, expires })
//           .where(eq(passwordResetTokens.email, email))
//           .returning()
//       : await db.insert(passwordResetTokens).values({ email, token, expires }).returning()

//     return {
//       success: true,
//       message: 'Make password reset token successfully',
//       data: verificationToken,
//     }
//   } catch (error: any) {
//     return {
//       success: false,
//       message: (error.message || error.toString()) as string,
//     }
//   }
// }
