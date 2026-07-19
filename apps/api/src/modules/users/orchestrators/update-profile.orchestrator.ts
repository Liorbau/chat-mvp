import { Injectable } from '@nestjs/common'
import type { User } from '@chat/contract'
import { UsersService } from '../users.service'
import type { UpdateProfileDto } from '../dto/update.profile.dto'

@Injectable()
export class UpdateProfileOrchestrator {
  constructor(private readonly usersService: UsersService) {}

  execute(userId: string, dto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateProfile(userId, dto)
  }
}
