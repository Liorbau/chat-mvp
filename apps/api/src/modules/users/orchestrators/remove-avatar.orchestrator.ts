import { Inject, Injectable, Logger } from '@nestjs/common'
import type { AvatarResponse } from '@chat/contract'
import { STORAGE_PROVIDER, type StorageProvider } from '../../storage/storage.provider'
import { UsersService } from '../users.service'

@Injectable()
export class RemoveAvatarOrchestrator {
  private readonly logger = new Logger(RemoveAvatarOrchestrator.name)

  constructor(
    private readonly usersService: UsersService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async execute(userId: string): Promise<AvatarResponse> {
    const removedKey = await this.usersService.getAvatarKey(userId)
    const updated = await this.usersService.clearAvatar(userId)
    if (removedKey !== null) {
      // Best-effort: a failed delete self-heals when the next upload overwrites it.
      try {
        await this.storage.delete(removedKey)
      } catch (error) {
        this.logger.warn(`Failed to delete avatar for ${userId}: ${String(error)}`)
      }
    }
    return { avatarUrl: updated.avatarUrl }
  }
}
