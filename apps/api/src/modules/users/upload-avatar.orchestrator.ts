import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { User } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage.provider'
import { AVATAR_CACHE_CONTROL, buildAvatarKey } from '../storage/storage.constants'
import { UsersDbService } from './users.dbService'
import type { AvatarUpload } from './avatar.types'

@Injectable()
export class UploadAvatarOrchestrator {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly usersDbService: UsersDbService,
    private readonly configService: ConfigService,
  ) {}

  async execute(userId: string, upload: AvatarUpload): Promise<User> {
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
}
