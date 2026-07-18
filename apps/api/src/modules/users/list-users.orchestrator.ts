import { Injectable } from '@nestjs/common'
import type { User } from '@chat/contract'
import { UsersService } from './users.service'

@Injectable()
export class ListUsersOrchestrator {
  constructor(private readonly usersService: UsersService) {}

  execute(): Promise<User[]> {
    return this.usersService.list()
  }
}
