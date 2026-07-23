import { Controller, Get, Redirect } from '@nestjs/common'
import {
  RedirectUpgradeReturnOrchestrator,
  type UpgradeReturnRedirect,
} from '../orchestrators/redirect-upgrade-return.orchestrator'

@Controller('account')
export class UpgradeReturnController {
  constructor(private readonly redirectUpgradeReturn: RedirectUpgradeReturnOrchestrator) {}

  @Get('upgrade-success')
  @Redirect()
  toSuccess(): UpgradeReturnRedirect {
    return this.redirectUpgradeReturn.execute('success')
  }

  @Get('upgrade-cancelled')
  @Redirect()
  toCancelled(): UpgradeReturnRedirect {
    return this.redirectUpgradeReturn.execute('cancelled')
  }
}
