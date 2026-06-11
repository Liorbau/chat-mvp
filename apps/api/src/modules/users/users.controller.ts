import { Controller, Get, UseGuards } from '@nestjs/common'
import type { User } from '@chat/contract'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(): User[] {
    return this.usersService.list()
  }
}
