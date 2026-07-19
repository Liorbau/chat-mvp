import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { UpdateProfileRequest, User } from '@chat/contract'
import bcrypt from 'bcrypt'
import { AppError } from '../../errors/AppError'
import { UsersDbService } from './users.dbService'
import { buildUserUpdate, deriveName, toPublicUser, type StoredAvatar } from './lib/user.mapper'

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

    const passwordMatches = await bcrypt.compare(password, stored.passwordHash)
    if (!passwordMatches) {
      return undefined
    }

    return toPublicUser(stored)
  }

  async create(input: CreateUserInput): Promise<User> {
    if ((await this.usersDbService.findByEmail(input.email)) !== undefined) {
      throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'An account with this email already exists')
    }

    const bcryptRounds = this.configService.getOrThrow<number>('BCRYPT_ROUNDS')
    const passwordHash = await bcrypt.hash(input.password, bcryptRounds)
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
      throw AppError.notFound('User not found')
    }
    return stored.avatar?.storageKey ?? null
  }

  async clearAvatar(userId: string): Promise<User> {
    const updated = await this.usersDbService.setAvatar(userId, null)
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }
    return updated
  }

  async setAvatar(userId: string, avatar: StoredAvatar): Promise<User> {
    const updated = await this.usersDbService.setAvatar(userId, avatar)
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }
    return updated
  }

  async updateProfile(userId: string, changes: UpdateProfileRequest): Promise<User> {
    const current = await this.usersDbService.findById(userId)
    if (current === undefined) {
      throw AppError.notFound('User not found')
    }

    if (changes.email !== undefined && changes.email !== current.email) {
      const existing = await this.usersDbService.findByEmail(changes.email)
      if (existing !== undefined && existing.id !== current.id) {
        throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'An account with this email already exists')
      }
    }

    const update = buildUserUpdate(current, changes)
    if (Object.keys(update).length === 0) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No fields to update')
    }

    const updated = await this.usersDbService.update(userId, update)
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }
    return updated
  }
}
