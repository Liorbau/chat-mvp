import { Inject, Injectable, Logger } from '@nestjs/common'
import type { User } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage.provider'
import { UsersDbService } from './users.dbService'

@Injectable()
export class RemoveAvatarOrchestrator {
  private readonly logger = new Logger(RemoveAvatarOrchestrator.name)

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly usersDbService: UsersDbService,
  ) {}

  async execute(userId: string): Promise<User> {
    const stored = await this.usersDbService.findStoredById(userId)
    if (stored === undefined) {
      throw AppError.notFound('User not found')
    }

    const updated = await this.usersDbService.setAvatar(userId, null)
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }

    // Best-effort: a failed delete self-heals when the next upload overwrites it.
    const storageKey = stored.avatar?.storageKey ?? null
    if (storageKey !== null) {
      try {
        await this.storage.delete(storageKey)
      } catch (error) {
        this.logger.warn(`Failed to delete avatar for ${userId}: ${String(error)}`)
      }
    }
    return updated
  }
}
