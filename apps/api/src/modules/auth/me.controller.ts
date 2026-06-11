import { Controller, Get, UseGuards } from '@nestjs/common'
import type { User } from '@chat/contract'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller()
export class MeController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    return user
  }
}
