import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConfigService } from '@nestjs/config'
import type { User } from '@chat/contract'
import type { StorageProvider } from '../storage/storage.provider'
import type { StoredAvatar, StoredUser } from './user.mapper'
import type { UsersDbService } from './users.dbService'
import type { AvatarUpload } from './avatar.types'
import { AvatarService } from './avatar.service'

const USER_ID = 'user-1'
const FIXED_KEY = `avatars/${USER_ID}`
const BASE_URL = 'https://cdn'

function publicUser(avatarUrl: string | null): User {
  return {
    id: USER_ID,
    name: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex@example.com',
    avatarUrl,
  }
}

function storedUser(avatar: StoredAvatar | null): StoredUser {
  return {
    id: USER_ID,
    name: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex@example.com',
    passwordHash: 'hash',
    avatar,
  }
}

function pngUpload(size = 1024): AvatarUpload {
  return { buffer: Buffer.from('fake'), mimeType: 'image/png', size }
}

function makeStorage(overrides: Partial<StorageProvider> = {}): StorageProvider {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeDb(overrides: Partial<UsersDbService> = {}): UsersDbService {
  return {
    setAvatar: vi.fn().mockResolvedValue(publicUser('https://cdn/x?v=1')),
    findStoredById: vi
      .fn()
      .mockResolvedValue(storedUser({ srcUrl: 'https://cdn/x?v=1', storageKey: FIXED_KEY })),
    ...overrides,
  } as unknown as UsersDbService
}

function makeConfig(): ConfigService {
  return { getOrThrow: vi.fn().mockReturnValue(BASE_URL) } as unknown as ConfigService
}

describe('AvatarService', () => {
  let storage: StorageProvider
  let db: UsersDbService
  let service: AvatarService

  beforeEach(() => {
    storage = makeStorage()
    db = makeDb()
    service = new AvatarService(storage, db, makeConfig())
  })

  describe('uploadAvatar', () => {
    it('stores the file at the fixed per-user key and persists the resolved avatar', async () => {
      const updated = await service.uploadAvatar(USER_ID, pngUpload())

      const putArg = vi.mocked(storage.put).mock.calls[0]?.[0]
      expect(putArg?.key).toBe(FIXED_KEY)
      expect(putArg?.contentType).toBe('image/png')
      expect(db.setAvatar).toHaveBeenCalledWith(USER_ID, {
        srcUrl: expect.stringMatching(new RegExp(`^${BASE_URL}/${FIXED_KEY}\\?v=`)),
        storageKey: FIXED_KEY,
      })
      // Overwrite in place => nothing to delete on replace => no orphans.
      expect(storage.delete).not.toHaveBeenCalled()
      expect(updated.avatarUrl).toBe('https://cdn/x?v=1')
    })
  })

  describe('removeAvatar', () => {
    it('clears the avatar and deletes the stored object', async () => {
      db = makeDb({ setAvatar: vi.fn().mockResolvedValue(publicUser(null)) })
      service = new AvatarService(storage, db, makeConfig())

      const updated = await service.removeAvatar(USER_ID)

      expect(db.setAvatar).toHaveBeenCalledWith(USER_ID, null)
      expect(storage.delete).toHaveBeenCalledWith(FIXED_KEY)
      expect(updated.avatarUrl).toBeNull()
    })

    it('skips storage delete when the avatar has no storageKey (external URL)', async () => {
      db = makeDb({
        setAvatar: vi.fn().mockResolvedValue(publicUser(null)),
        findStoredById: vi
          .fn()
          .mockResolvedValue(storedUser({ srcUrl: 'https://gravatar/x', storageKey: null })),
      })
      service = new AvatarService(storage, db, makeConfig())

      const updated = await service.removeAvatar(USER_ID)

      expect(storage.delete).not.toHaveBeenCalled()
      expect(updated.avatarUrl).toBeNull()
    })

    it('still succeeds when the best-effort object delete fails', async () => {
      db = makeDb({ setAvatar: vi.fn().mockResolvedValue(publicUser(null)) })
      storage = makeStorage({ delete: vi.fn().mockRejectedValue(new Error('store down')) })
      service = new AvatarService(storage, db, makeConfig())

      const updated = await service.removeAvatar(USER_ID)
      expect(updated.avatarUrl).toBeNull()
    })
  })
})
