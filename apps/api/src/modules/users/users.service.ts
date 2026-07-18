import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { UpdateProfileRequest, User } from '@chat/contract'
import bcrypt from 'bcrypt'
import { AppError } from '../../errors/AppError'
import { toPublicUser, type UserUpdate, UsersDbService } from './users.dbService'

export type CreateUserInput = {
  email: string
  password: string
  firstName: string
  lastName: string
}

function deriveName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
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

  async updateProfile(userId: string, changes: UpdateProfileRequest): Promise<User> {
    const current = await this.usersDbService.findById(userId)
    if (current === undefined) {
      throw AppError.notFound('User not found')
    }

    const update = await this.buildUserUpdate(current, changes)
    if (Object.keys(update).length === 0) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No fields to update')
    }

    const updated = await this.usersDbService.update(userId, update)
    if (updated === undefined) {
      throw AppError.notFound('User not found')
    }
    return updated
  }

  // Translates a partial profile request into a concrete DAO update: re-derives the
  // display name when either name part changes, and guards email uniqueness.
  private async buildUserUpdate(current: User, changes: UpdateProfileRequest): Promise<UserUpdate> {
    const update: UserUpdate = {}

    if (changes.firstName !== undefined || changes.lastName !== undefined) {
      const firstName = changes.firstName ?? current.firstName
      const lastName = changes.lastName ?? current.lastName
      update.firstName = firstName
      update.lastName = lastName
      update.name = deriveName(firstName, lastName)
    }

    if (changes.email !== undefined && changes.email !== current.email) {
      const existing = await this.usersDbService.findByEmail(changes.email)
      if (existing !== undefined && existing.id !== current.id) {
        throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'An account with this email already exists')
      }
      update.email = changes.email
    }

    return update
  }
}
