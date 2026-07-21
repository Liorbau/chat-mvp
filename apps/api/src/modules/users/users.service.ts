import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { UpdateProfileRequest, User } from '@chat/contract'
import { HttpAppError } from '../../errors/HttpAppError'
import { UsersDbService } from './users.dbService'
import { buildUserUpdate, deriveName, toPublicUser, type StoredAvatar } from './lib/user.mapper'
import { hashPassword, verifyPassword } from './lib/password'

export type CreateUserInput = {
  email: string
  password: string
  firstName: string
  lastName: string
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersDbService: UsersDbService,
    private readonly configService: ConfigService,
  ) {}

  async findById(userId: string): Promise<User | undefined> {
    return this.usersDbService.findById(userId)
  }

  async list(): Promise<User[]> {
    return this.usersDbService.list()
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.usersDbService.findByIds(userIds)
  }

  async findExistingIds(userIds: string[]): Promise<Set<string>> {
    return this.usersDbService.findExistingIds(userIds)
  }

  async verifyCredentials(email: string, password: string): Promise<User | undefined> {
    const stored = await this.usersDbService.findByEmail(email)
    if (stored === undefined) {
      return undefined
    }

    const passwordMatches = await verifyPassword(password, stored.passwordHash)
    if (!passwordMatches) {
      return undefined
    }

    return toPublicUser(stored)
  }

  async create(input: CreateUserInput): Promise<User> {
    if ((await this.usersDbService.findByEmail(input.email)) !== undefined) {
      throw HttpAppError.conflict(
        'EMAIL_ALREADY_EXISTS',
        'An account with this email already exists',
      )
    }

    const bcryptRounds = this.configService.getOrThrow<number>('BCRYPT_ROUNDS')
    const passwordHash = await hashPassword(input.password, bcryptRounds)
    const stored = await this.usersDbService.create({
      name: deriveName(input.firstName, input.lastName),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      avatar: null,
    })
    return toPublicUser(stored)
  }

  async getAvatarKey(userId: string): Promise<string | null> {
    const stored = await this.usersDbService.findStoredById(userId)
    if (stored === undefined) {
      throw HttpAppError.notFound('User not found')
    }
    return stored.avatar?.storageKey ?? null
  }

  async clearAvatar(userId: string): Promise<User> {
    const updated = await this.usersDbService.setAvatar(userId, null)
    if (updated === undefined) {
      throw HttpAppError.notFound('User not found')
    }
    return updated
  }

  async setAvatar(userId: string, avatar: StoredAvatar): Promise<User> {
    const updated = await this.usersDbService.setAvatar(userId, avatar)
    if (updated === undefined) {
      throw HttpAppError.notFound('User not found')
    }
    return updated
  }

  async updateProfile(userId: string, changes: UpdateProfileRequest): Promise<User> {
    const current = await this.usersDbService.findById(userId)
    if (current === undefined) {
      throw HttpAppError.notFound('User not found')
    }

    const update = buildUserUpdate(current, changes)
    if (Object.keys(update).length === 0) {
      throw HttpAppError.badRequest('No fields to update')
    }

    const updated = await this.usersDbService.update(userId, update)
    if (updated === undefined) {
      throw HttpAppError.notFound('User not found')
    }
    return updated
  }

  async isEmailTaken(email: string, exceptUserId: string): Promise<boolean> {
    const existing = await this.usersDbService.findByEmail(email)
    return existing !== undefined && existing.id !== exceptUserId
  }

  async changeEmail(userId: string, newEmail: string): Promise<User> {
    const current = await this.usersDbService.findById(userId)
    if (current === undefined) {
      throw HttpAppError.notFound('User not found')
    }

    const normalized = newEmail.trim().toLowerCase()
    if (normalized === current.email) {
      return current
    }

    if (await this.isEmailTaken(normalized, userId)) {
      throw HttpAppError.conflict(
        'EMAIL_ALREADY_EXISTS',
        'That email is already in use by another account.',
      )
    }

    const updated = await this.usersDbService.setEmailWithHistory(userId, normalized)
    if (updated === undefined) {
      throw HttpAppError.notFound('User not found')
    }
    return updated
  }
}
