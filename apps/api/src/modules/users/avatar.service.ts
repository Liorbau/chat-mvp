import { randomUUID } from 'node:crypto'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { User } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage.provider'
import {
  ALLOWED_AVATAR_CONTENT_TYPES,
  AVATAR_CACHE_CONTROL,
  AVATAR_MAX_BYTES,
  buildAvatarKey,
} from '../storage/storage.constants'
import { UsersDbService } from './users.dbService'

export type AvatarUpload = {
  buffer: Buffer
  mimeType: string
  size: number
}

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name)

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly usersDbService: UsersDbService,
  ) {}

  async uploadAvatar(userId: string, file: AvatarUpload): Promise<User> {
    if (!ALLOWED_AVATAR_CONTENT_TYPES.includes(file.mimeType)) {
      throw AppError.badRequest(
        'VALIDATION_ERROR',
        'Unsupported image type (use PNG, JPEG, or WEBP)',
      )
    }
    if (file.size > AVATAR_MAX_BYTES) {
      throw AppError.badRequest('VALIDATION_ERROR', 'Image is too large (max 5 MB)')
    }

    // Fixed key, overwritten in place — a replace never leaves an orphan.
    await this.storage.put({
      key: buildAvatarKey(userId),
      body: file.buffer,
      contentType: file.mimeType,
      cacheControl: AVATAR_CACHE_CONTROL,
    })

    const updated = await this.usersDbService.setAvatarVersion(userId, randomUUID())
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }
    return updated
  }

  async removeAvatar(userId: string): Promise<User> {
    const updated = await this.usersDbService.setAvatarVersion(userId, null)
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }

    // Best-effort: if this fails, the single fixed object is overwritten by the
    // next upload, so it self-heals — no accumulating orphans.
    try {
      await this.storage.delete(buildAvatarKey(userId))
    } catch (error) {
      this.logger.warn(`Failed to delete avatar for ${userId}: ${String(error)}`)
    }
    return updated
  }
}
