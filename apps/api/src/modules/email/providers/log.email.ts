import { Logger } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { EmailProvider, SendEmailInput, SendEmailResult } from './email.provider'

export class LogEmailProvider implements EmailProvider {
  private readonly logger = new Logger(LogEmailProvider.name)

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const messageId = `log:${randomUUID()}`
    this.logger.log(`[${messageId}] to=${input.to} subject="${input.subject}"\n${input.text}`)
    return { messageId }
  }
}
