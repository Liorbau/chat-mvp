import { Controller, Get, UseGuards } from '@nestjs/common'
import type { User } from '@chat/contract'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ListUsersOrchestrator } from './orchestrators/list-users.orchestrator'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly listUsersOrchestrator: ListUsersOrchestrator) {}

  @Get()
  async list(): Promise<User[]> {
    return this.listUsersOrchestrator.execute()
  }
}
