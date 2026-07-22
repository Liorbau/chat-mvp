import { describe, expect, it, vi } from 'vitest'
import type { ConfigService } from '@nestjs/config'
import type { User } from '@chat/contract'
import { HttpAppError } from '../../errors/HttpAppError'
import type { StoredAvatar, StoredUser } from './lib/user.mapper'
import { PasswordHasher } from './password-hasher.service'
import type { UsersDbService } from './users.dbService'
import { UsersService } from './users.service'

vi.mock('bcrypt', () => ({ default: { hash: vi.fn(async () => 'hashed-pw'), compare: vi.fn() } }))

const USER_ID = 'user-1'
const AVATAR: StoredAvatar = {
  srcUrl: 'https://cdn/avatars/user-1?v=1',
  storageKey: 'avatars/user-1',
}

function publicUser(overrides: Partial<User> = {}): User {
  return {
    id: USER_ID,
    name: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex@example.com',
    avatarUrl: null,
    previousEmails: [],
    ...overrides,
  }
}

function storedUser(overrides: Partial<StoredUser> = {}): StoredUser {
  return {
    id: USER_ID,
    name: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex@example.com',
    passwordHash: 'hash',
    avatar: null,
    previousEmails: [],
    tokenVersion: 0,
    ...overrides,
  }
}

function makeDb(overrides: Partial<UsersDbService> = {}): UsersDbService {
  return {
    findStoredById: vi.fn(),
    setAvatar: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    ...overrides,
  } as unknown as UsersDbService
}

function makeService(db: UsersDbService): UsersService {
  const config = { getOrThrow: vi.fn().mockReturnValue(4) } as unknown as ConfigService
  return new UsersService(db, new PasswordHasher(config))
}

describe('UsersService', () => {
  describe('getAvatarKey', () => {
    it('returns the stored key when the avatar has one', async () => {
      const db = makeDb({
        findStoredById: vi.fn().mockResolvedValue(storedUser({ avatar: AVATAR })),
      })

      expect(await makeService(db).getAvatarKey(USER_ID)).toBe('avatars/user-1')
    })

    it('returns null when the user has no avatar', async () => {
      const db = makeDb({ findStoredById: vi.fn().mockResolvedValue(storedUser({ avatar: null })) })

      expect(await makeService(db).getAvatarKey(USER_ID)).toBeNull()
    })

    it('throws notFound when the user is missing', async () => {
      const db = makeDb({ findStoredById: vi.fn().mockResolvedValue(undefined) })

      await expect(makeService(db).getAvatarKey(USER_ID)).rejects.toThrow(HttpAppError)
    })
  })

  describe('clearAvatar', () => {
    it('clears the avatar and returns the updated user', async () => {
      const db = makeDb({ setAvatar: vi.fn().mockResolvedValue(publicUser({ avatarUrl: null })) })

      const result = await makeService(db).clearAvatar(USER_ID)

      expect(db.setAvatar).toHaveBeenCalledWith(USER_ID, null)
      expect(result.avatarUrl).toBeNull()
    })

    it('throws notFound when the user is missing', async () => {
      const db = makeDb({ setAvatar: vi.fn().mockResolvedValue(undefined) })

      await expect(makeService(db).clearAvatar(USER_ID)).rejects.toThrow(HttpAppError)
    })
  })

  describe('setAvatar', () => {
    it('persists the avatar value object and returns the updated user', async () => {
      const db = makeDb({
        setAvatar: vi.fn().mockResolvedValue(publicUser({ avatarUrl: AVATAR.srcUrl })),
      })

      const result = await makeService(db).setAvatar(USER_ID, AVATAR)

      expect(db.setAvatar).toHaveBeenCalledWith(USER_ID, AVATAR)
      expect(result.avatarUrl).toBe(AVATAR.srcUrl)
    })

    it('throws notFound when the user is missing', async () => {
      const db = makeDb({ setAvatar: vi.fn().mockResolvedValue(undefined) })

      await expect(makeService(db).setAvatar(USER_ID, AVATAR)).rejects.toThrow(HttpAppError)
    })
  })

  describe('create', () => {
    it('creates a user with a hashed password and no avatar', async () => {
      const db = makeDb({
        findByEmail: vi.fn().mockResolvedValue(undefined),
        create: vi.fn().mockResolvedValue(storedUser()),
      })

      const result = await makeService(db).create({
        email: 'alex@example.com',
        password: 'pw',
        firstName: 'Alex',
        lastName: 'Rivera',
      })

      expect(db.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alex Rivera', passwordHash: 'hashed-pw', avatar: null }),
      )
      expect(result.avatarUrl).toBeNull()
    })

    it('rejects a duplicate email with a conflict', async () => {
      const db = makeDb({ findByEmail: vi.fn().mockResolvedValue(storedUser()) })

      await expect(
        makeService(db).create({
          email: 'alex@example.com',
          password: 'pw',
          firstName: 'Alex',
          lastName: 'Rivera',
        }),
      ).rejects.toThrow(HttpAppError)
    })
  })

  describe('updateProfile', () => {
    it('re-derives the display name when a name part changes', async () => {
      const db = makeDb({
        findById: vi.fn().mockResolvedValue(publicUser()),
        update: vi
          .fn()
          .mockResolvedValue(publicUser({ firstName: 'Alexander', name: 'Alexander Rivera' })),
      })

      const result = await makeService(db).updateProfile(USER_ID, { firstName: 'Alexander' })

      expect(db.update).toHaveBeenCalledWith(USER_ID, {
        firstName: 'Alexander',
        lastName: 'Rivera',
        name: 'Alexander Rivera',
      })
      expect(result.name).toBe('Alexander Rivera')
    })

    it('throws notFound when the user is missing', async () => {
      const db = makeDb({ findById: vi.fn().mockResolvedValue(undefined) })

      await expect(makeService(db).updateProfile(USER_ID, { firstName: 'X' })).rejects.toThrow(
        HttpAppError,
      )
    })

    it('rejects an empty change set', async () => {
      const db = makeDb({ findById: vi.fn().mockResolvedValue(publicUser()) })

      await expect(makeService(db).updateProfile(USER_ID, {})).rejects.toThrow(HttpAppError)
    })
  })
})
