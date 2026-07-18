import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import type { ObjectStorage } from '../storage/object.storage'
import { AvatarService, type AvatarUpload } from './avatar.service'
import type { UsersDbService } from './users.dbService'

const USER_ID = 'user-1'
const FIXED_KEY = `avatars/${USER_ID}`

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

function pngUpload(size = 1024): AvatarUpload {
  return { buffer: Buffer.from('fake'), mimeType: 'image/png', size }
}

function makeStorage(overrides: Partial<ObjectStorage> = {}): ObjectStorage {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeDb(overrides: Partial<UsersDbService> = {}): UsersDbService {
  return {
    setAvatarVersion: vi.fn().mockResolvedValue(publicUser('https://cdn/x?v=1')),
    ...overrides,
  } as unknown as UsersDbService
}

describe('AvatarService', () => {
  let storage: ObjectStorage
  let db: UsersDbService
  let service: AvatarService

  beforeEach(() => {
    storage = makeStorage()
    db = makeDb()
    service = new AvatarService(storage, db)
  })

  describe('uploadAvatar', () => {
    it('overwrites the fixed per-user key and sets a fresh version (no delete of old)', async () => {
      const updated = await service.uploadAvatar(USER_ID, pngUpload())

      const putArg = vi.mocked(storage.put).mock.calls[0]?.[0]
      expect(putArg?.key).toBe(FIXED_KEY)
      expect(putArg?.contentType).toBe('image/png')
      expect(db.setAvatarVersion).toHaveBeenCalledWith(USER_ID, expect.any(String))
      // Overwrite in place => nothing to delete on replace => no orphans.
      expect(storage.delete).not.toHaveBeenCalled()
      expect(updated.avatarUrl).toBe('https://cdn/x?v=1')
    })

    it('rejects an unsupported mime type without storing anything (400)', async () => {
      await expect(
        service.uploadAvatar(USER_ID, {
          buffer: Buffer.from('x'),
          mimeType: 'image/gif',
          size: 10,
        }),
      ).rejects.toBeInstanceOf(AppError)
      expect(storage.put).not.toHaveBeenCalled()
    })

    it('rejects an oversize file without storing anything (400)', async () => {
      await expect(
        service.uploadAvatar(USER_ID, pngUpload(6 * 1024 * 1024)),
      ).rejects.toBeInstanceOf(AppError)
      expect(storage.put).not.toHaveBeenCalled()
    })
  })

  describe('removeAvatar', () => {
    it('clears the version and deletes the fixed object', async () => {
      db = makeDb({ setAvatarVersion: vi.fn().mockResolvedValue(publicUser(null)) })
      service = new AvatarService(storage, db)

      const updated = await service.removeAvatar(USER_ID)

      expect(db.setAvatarVersion).toHaveBeenCalledWith(USER_ID, null)
      expect(storage.delete).toHaveBeenCalledWith(FIXED_KEY)
      expect(updated.avatarUrl).toBeNull()
    })

    it('still succeeds when the best-effort object delete fails', async () => {
      db = makeDb({ setAvatarVersion: vi.fn().mockResolvedValue(publicUser(null)) })
      storage = makeStorage({ delete: vi.fn().mockRejectedValue(new Error('store down')) })
      service = new AvatarService(storage, db)

      const updated = await service.removeAvatar(USER_ID)
      expect(updated.avatarUrl).toBeNull()
    })
  })
})
