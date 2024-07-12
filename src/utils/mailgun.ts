import formData from 'form-data'
import Mailgun, { MailgunMessageData } from 'mailgun.js'

import { SendResetPasswordEmailParams, SendVerificationEmailParams } from '@/types/token.type'

export async function sendEmailToken({ name, email, token }: SendVerificationEmailParams) {
  try {
    const mailgun = new Mailgun(formData)
    const client = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY! })

    const data: MailgunMessageData = {
      from: `Sprout & Scribble <no-reply@${process.env.NEXT_PUBLIC_DOMAIN}>`,
      to: `${name} <${email}>`,
      subject: 'Verify your email - Sprout & Scribble',
      template: 'email_verification',
      'h:X-Mailgun-Variables': JSON.stringify({
        verification_link: `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${token}`,
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
