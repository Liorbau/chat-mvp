import { Injectable } from '@nestjs/common'
import type { User } from '@chat/contract'
import { AvatarService } from './avatar.service'

@Injectable()
export class RemoveAvatarOrchestrator {
  constructor(private readonly avatarService: AvatarService) {}

  execute(userId: string): Promise<User> {
    return this.avatarService.removeAvatar(userId)
  }
}
