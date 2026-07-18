import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConfigService } from '@nestjs/config'
import type { User } from '@chat/contract'
import type { StorageProvider } from '../storage/storage.provider'
import type { UsersDbService } from './users.dbService'
import type { AvatarUpload } from './avatar.types'
import { UploadAvatarOrchestrator } from './upload-avatar.orchestrator'

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
    ...overrides,
  } as unknown as UsersDbService
}

function makeConfig(): ConfigService {
  return { getOrThrow: vi.fn().mockReturnValue(BASE_URL) } as unknown as ConfigService
}

describe('UploadAvatarOrchestrator', () => {
  let storage: StorageProvider
  let db: UsersDbService
  let orchestrator: UploadAvatarOrchestrator

  beforeEach(() => {
    storage = makeStorage()
    db = makeDb()
    orchestrator = new UploadAvatarOrchestrator(storage, db, makeConfig())
  })

  it('stores the file at the fixed per-user key and persists the resolved avatar', async () => {
    const updated = await orchestrator.execute(USER_ID, pngUpload())

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
