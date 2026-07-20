import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import type { ConfigService } from '@nestjs/config'
import type { EmailProvider, SendEmailInput, SendEmailResult } from './email.provider'

export class SesEmailProvider implements EmailProvider {
  private readonly client: SESv2Client
  private readonly from: string

  constructor(configService: ConfigService) {
    this.client = new SESv2Client({
      region: configService.getOrThrow<string>('EMAIL_SES_REGION'),
    })
    this.from = configService.getOrThrow<string>('EMAIL_FROM')
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const response = await this.client.send(
      new SendEmailCommand({
        FromEmailAddress: this.from,
        Destination: { ToAddresses: [input.to] },
        Content: {
          Simple: {
            Subject: { Data: input.subject },
            Body: {
              Text: { Data: input.text },
              ...(input.html != null ? { Html: { Data: input.html } } : {}),
            },
          },
        },
      }),
    )
    if (response.MessageId == null) {
      throw new Error('SES send returned no MessageId')
    }
    return { messageId: response.MessageId }
  }
}
