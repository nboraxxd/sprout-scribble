'use server'

import { db } from '@/server'
import { eq } from 'drizzle-orm'
import { actionClient } from '@/lib/safe-action'
import bcrypt from 'bcrypt'

import { users } from '@/server/schema'
import { loginSchema, registerSchema } from '@/lib/schema-validations/auth.schema'
import { generateVerificationToken, sendVerificationEmail } from '@/server/actions/token.action'

export const emailRegister = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput: { name, email, password } }) => {
    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      if (existingUser.emailVerified) {
        return {
          success: false,
          message: 'User already exists',
        }
      } else {
        const verificationToken = await generateVerificationToken(email)

        if (!verificationToken.success) {
          return {
            success: false,
            message: verificationToken.message,
          }
        }

        await sendVerificationEmail({
          email: verificationToken.data!.email,
          token: verificationToken.data!.token,
        })

        return {
          success: true,
          message: 'Email verification token resent',
        }
      }
    }

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    })

    const verificationToken = await generateVerificationToken(email)

    await sendVerificationEmail({
      email: verificationToken.data!.email,
      token: verificationToken.data!.token,
    })

    return {
      success: true,
      message: 'Email verification token resent',
    }
  })

export const emailLogin = actionClient.schema(loginSchema).action(async ({ parsedInput: { email, password } }) => {
  return { email }
})
