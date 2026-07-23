import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@chat/contract'
import type { StorageProvider } from '../../storage/storage.provider'
import type { UsersService } from '../users.service'
import type { AvatarUpload } from '../lib/avatar.types'
import { UploadAvatarOrchestrator } from './upload-avatar.orchestrator'

const USER_ID = 'user-1'
const FIXED_KEY = `avatars/${USER_ID}`
const PUBLIC_URL = `https://cdn/${FIXED_KEY}`

function uploadedUser(avatarUrl: string): User {
  return {
    id: USER_ID,
    name: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex@example.com',
    avatarUrl,
    previousEmails: [],
    subscription: { planKey: 'free', status: 'none' },
  }
}

function pngUpload(): AvatarUpload {
  return { buffer: Buffer.from('fake'), mimeType: 'image/png', size: 1024 }
}

function makeStorage(overrides: Partial<StorageProvider> = {}): StorageProvider {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    publicUrl: vi.fn().mockReturnValue(PUBLIC_URL),
    ...overrides,
  }
}

function makeUsers(overrides: Partial<UsersService> = {}): UsersService {
  return {
    setAvatar: vi
      .fn()
      .mockImplementation((_id: string, avatar: { srcUrl: string }) =>
        Promise.resolve(uploadedUser(avatar.srcUrl)),
      ),
    ...overrides,
  } as unknown as UsersService
}

describe('UploadAvatarOrchestrator', () => {
  let storage: StorageProvider
  let users: UsersService
  let orchestrator: UploadAvatarOrchestrator

  beforeEach(() => {
    storage = makeStorage()
    users = makeUsers()
    orchestrator = new UploadAvatarOrchestrator(storage, users)
  })

  it('stores the file at the fixed key and persists a versioned public URL', async () => {
    const result = await orchestrator.execute(USER_ID, pngUpload())

    const putArg = vi.mocked(storage.put).mock.calls[0]?.[0]
    expect(putArg?.key).toBe(FIXED_KEY)
    expect(putArg?.contentType).toBe('image/png')
    expect(storage.publicUrl).toHaveBeenCalledWith(FIXED_KEY)
    expect(users.setAvatar).toHaveBeenCalledWith(USER_ID, {
      srcUrl: expect.stringMatching(new RegExp(`^${PUBLIC_URL}\\?v=`)),
      storageKey: FIXED_KEY,
    })
    // Overwrite in place => nothing to delete on replace => no orphans.
    expect(storage.delete).not.toHaveBeenCalled()
    expect(result.avatarUrl).toMatch(new RegExp(`^${PUBLIC_URL}\\?v=`))
  })
})
