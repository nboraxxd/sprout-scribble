import formData from 'form-data'
import Mailgun, { MailgunMessageData } from 'mailgun.js'

import { SendEmailParams } from '@/types/token.type'

export async function sendEmail({ name, email, subject, html }: SendEmailParams) {
  try {
    const mailgun = new Mailgun(formData)
    const client = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY })

    const data: MailgunMessageData = {
      from: `Sprout & Scribble <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: `${name} <${email}>`,
      subject,
      html,
    }

    await client.messages.create(process.env.MAILGUN_DOMAIN, data)

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
