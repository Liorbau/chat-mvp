import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import type { User } from '@chat/contract'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { UpdateProfileDto } from '../users/dto/update.profile.dto'
import { UsersService } from '../users/users.service'
import { JwtAuthGuard } from './jwt.auth.guard'

@Controller()
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: User): User {
    return user
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateProfile(user.id, dto)
  }
}
