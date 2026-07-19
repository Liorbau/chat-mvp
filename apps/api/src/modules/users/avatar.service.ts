import { randomUUID } from 'node:crypto'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { User } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage.provider'
import { AVATAR_CACHE_CONTROL, buildAvatarKey } from '../storage/storage.constants'
import { UsersDbService } from './users.dbService'
import type { AvatarUpload } from './avatar.types'

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name)

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly usersDbService: UsersDbService,
    private readonly configService: ConfigService,
  ) {}

  async uploadAvatar(userId: string, upload: AvatarUpload): Promise<User> {
    const storageKey = buildAvatarKey(userId)
    await this.storage.put({
      key: storageKey,
      body: upload.buffer,
      contentType: upload.mimeType,
      cacheControl: AVATAR_CACHE_CONTROL,
    })

    const baseUrl = this.configService.getOrThrow<string>('STORAGE_PUBLIC_BASE_URL')
    const srcUrl = `${baseUrl}/${storageKey}?v=${randomUUID()}`

    const updated = await this.usersDbService.setAvatar(userId, { srcUrl, storageKey })
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }
    return updated
  }

  async removeAvatar(userId: string): Promise<User> {
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
