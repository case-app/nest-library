import { Injectable } from '@nestjs/common'
const formData = require('form-data')
const Mailgun = require('mailgun.js')

@Injectable()
// This Service is for MAILGUN only.
export class EmailService {
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
    attachments?: any
  }): Promise<any> {
    const mailgun = new Mailgun(formData)
    const mg = mailgun.client({
      username: 'buddyweb',
      key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    })

    return mg.messages
      .create(process.env.MAILGUN_DOMAIN, {
        from: process.env.MAIL_FROM,
        to: process.env.EMAIL_MODE !== 'debug' ? to : process.env.DEBUG_MAIL_TO,
        bcc:
          process.env.EMAIL_MODE !== 'debug' ? bcc : process.env.DEBUG_MAIL_TO,
        subject,
        html,
        attachment: attachments
      })
      .then((msg) => console.log(msg)) // logs response data
      .catch((err) => console.log(err)) // logs any error
  }
}
