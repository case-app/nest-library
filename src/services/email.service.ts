import { Injectable } from '@nestjs/common'
import * as mailgun from 'mailgun-js'

@Injectable()
// This Service is for MAILGUN only
export class EmailService {
  // Credentials must be specified in ENV file to send emails
  private mailgun = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  })

  send({
    to,
    bcc,
    subject,
    html,
    attachments
  }: {
    to: string
    bcc?: string
    subject: string
    html: string
    attachments?: mailgun.Attachment[]
  }): Promise<mailgun.messages.SendResponse> {
    return this.mailgun.messages().send({
      from: process.env.MAIL_FROM,
      to: process.env.EMAIL_MODE !== 'debug' ? to : process.env.DEBUG_MAIL_TO,
      bcc: process.env.EMAIL_MODE !== 'debug' ? bcc : process.env.DEBUG_MAIL_TO,
      subject,
      html,
      attachment: attachments
    })
  }
}
