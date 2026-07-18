import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@chat/contract'
import type { StorageProvider } from '../storage/storage.provider'
import type { StoredAvatar, StoredUser } from './user.mapper'
import type { UsersDbService } from './users.dbService'
import { RemoveAvatarOrchestrator } from './remove-avatar.orchestrator'

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

function makeStorage(overrides: Partial<StorageProvider> = {}): StorageProvider {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeDb(overrides: Partial<UsersDbService> = {}): UsersDbService {
  return {
    setAvatar: vi.fn().mockResolvedValue(publicUser(null)),
    findStoredById: vi
      .fn()
      .mockResolvedValue(storedUser({ srcUrl: 'https://cdn/x?v=1', storageKey: FIXED_KEY })),
    ...overrides,
  } as unknown as UsersDbService
}

describe('RemoveAvatarOrchestrator', () => {
  let storage: StorageProvider
  let db: UsersDbService
  let orchestrator: RemoveAvatarOrchestrator

  beforeEach(() => {
    storage = makeStorage()
    db = makeDb()
    orchestrator = new RemoveAvatarOrchestrator(storage, db)
  })

  it('clears the avatar and deletes the stored object', async () => {
    const updated = await orchestrator.execute(USER_ID)

    expect(db.setAvatar).toHaveBeenCalledWith(USER_ID, null)
    expect(storage.delete).toHaveBeenCalledWith(FIXED_KEY)
    expect(updated.avatarUrl).toBeNull()
  })

  it('skips storage delete when the avatar has no storageKey (external URL)', async () => {
    db = makeDb({
      findStoredById: vi
        .fn()
        .mockResolvedValue(storedUser({ srcUrl: 'https://gravatar/x', storageKey: null })),
    })
    orchestrator = new RemoveAvatarOrchestrator(storage, db)

    const updated = await orchestrator.execute(USER_ID)

    expect(storage.delete).not.toHaveBeenCalled()
    expect(updated.avatarUrl).toBeNull()
  })

  it('still succeeds when the best-effort object delete fails', async () => {
    storage = makeStorage({ delete: vi.fn().mockRejectedValue(new Error('store down')) })
    orchestrator = new RemoveAvatarOrchestrator(storage, db)

    const updated = await orchestrator.execute(USER_ID)

    expect(updated.avatarUrl).toBeNull()
  })
})
