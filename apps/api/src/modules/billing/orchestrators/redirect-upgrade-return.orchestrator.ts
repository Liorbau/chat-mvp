import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { buildWebAppUpgradeReturnUrl, type UpgradeReturnStatus } from '../lib/checkout-urls'

export type UpgradeReturnRedirect = {
  url: string
  statusCode: number
}

@Injectable()
export class RedirectUpgradeReturnOrchestrator {
  constructor(private readonly configService: ConfigService) {}

  execute(status: UpgradeReturnStatus): UpgradeReturnRedirect {
    const origin = this.configService.getOrThrow<string>('CORS_ORIGIN')
    return {
      url: buildWebAppUpgradeReturnUrl(origin, status),
      statusCode: 302,
    }
  }
}
