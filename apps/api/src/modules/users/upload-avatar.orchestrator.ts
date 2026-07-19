import { Injectable } from '@nestjs/common'
import type { User } from '@chat/contract'
import { AvatarService } from './avatar.service'
import type { AvatarUpload } from './avatar.types'

@Injectable()
export class UploadAvatarOrchestrator {
  constructor(private readonly avatarService: AvatarService) {}

  execute(userId: string, upload: AvatarUpload): Promise<User> {
    return this.avatarService.uploadAvatar(userId, upload)
  }
}
