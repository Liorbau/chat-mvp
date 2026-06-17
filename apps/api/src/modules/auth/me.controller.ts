import { Controller, Get, UseGuards } from '@nestjs/common'
import type { User } from '@chat/contract'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { JwtAuthGuard } from './jwt.auth.guard'

@Controller()
@UseGuards(JwtAuthGuard)
export class MeController {
  @Get('me')
  me(@CurrentUser() user: User): User {
    return user
  }
}
