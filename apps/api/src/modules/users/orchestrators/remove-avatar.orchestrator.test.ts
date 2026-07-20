import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@chat/contract'
import type { StorageProvider } from '../../storage/storage.provider'
import type { UsersService } from '../users.service'
import { RemoveAvatarOrchestrator } from './remove-avatar.orchestrator'

const USER_ID = 'user-1'
const FIXED_KEY = `avatars/${USER_ID}`

function clearedUser(): User {
  return {
    id: USER_ID,
    name: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex@example.com',
    avatarUrl: null,
    previousEmails: [],
  }
}

function makeStorage(overrides: Partial<StorageProvider> = {}): StorageProvider {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    publicUrl: vi.fn().mockReturnValue(`https://cdn/${FIXED_KEY}`),
    ...overrides,
  }
}

function makeUsers(overrides: Partial<UsersService> = {}): UsersService {
  return {
    getAvatarKey: vi.fn().mockResolvedValue(FIXED_KEY),
    clearAvatar: vi.fn().mockResolvedValue(clearedUser()),
    ...overrides,
  } as unknown as UsersService
}

describe('RemoveAvatarOrchestrator', () => {
  let storage: StorageProvider
  let users: UsersService
  let orchestrator: RemoveAvatarOrchestrator

  beforeEach(() => {
    storage = makeStorage()
    users = makeUsers()
    orchestrator = new RemoveAvatarOrchestrator(users, storage)
  })

  it('clears the avatar and deletes the previous object', async () => {
    const result = await orchestrator.execute(USER_ID)

    expect(users.clearAvatar).toHaveBeenCalledWith(USER_ID)
    expect(storage.delete).toHaveBeenCalledWith(FIXED_KEY)
    expect(result.avatarUrl).toBeNull()
  })

  it('skips the storage delete when there is no stored key (external URL / no avatar)', async () => {
    users = makeUsers({ getAvatarKey: vi.fn().mockResolvedValue(null) })
    orchestrator = new RemoveAvatarOrchestrator(users, storage)

    const result = await orchestrator.execute(USER_ID)

    expect(storage.delete).not.toHaveBeenCalled()
    expect(result.avatarUrl).toBeNull()
  })

  it('still succeeds when the best-effort object delete fails', async () => {
    storage = makeStorage({ delete: vi.fn().mockRejectedValue(new Error('store down')) })
    orchestrator = new RemoveAvatarOrchestrator(users, storage)

    await expect(orchestrator.execute(USER_ID)).resolves.toEqual({ avatarUrl: null })
  })
})
