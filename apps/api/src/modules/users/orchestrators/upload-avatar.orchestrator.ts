import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import type { AvatarResponse } from '@chat/contract'
import { STORAGE_PROVIDER, type StorageProvider } from '../../storage/storage.provider'
import { AVATAR_CACHE_CONTROL, buildAvatarKey } from '../../storage/storage.constants'
import { UsersService } from '../users.service'
import type { AvatarUpload } from '../lib/avatar.types'

@Injectable()
export class UploadAvatarOrchestrator {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly usersService: UsersService,
  ) {}

  async execute(userId: string, upload: AvatarUpload): Promise<AvatarResponse> {
    const storageKey = buildAvatarKey(userId)
    await this.storage.put({
      key: storageKey,
      body: upload.buffer,
      contentType: upload.mimeType,
      cacheControl: AVATAR_CACHE_CONTROL,
    })
    // ?v=<uuid> busts the browser cache so a replaced avatar shows immediately.
    const srcUrl = `${this.storage.publicUrl(storageKey)}?v=${randomUUID()}`
    const updated = await this.usersService.setAvatar(userId, { srcUrl, storageKey })
    return { avatarUrl: updated.avatarUrl }
  }
}
