import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { User } from '@chat/contract'
import bcrypt from 'bcrypt'
import { AppError } from '../../errors/AppError'
import type { StoredUser } from '../../db/users.store'
import { toPublicUser, UsersDbService } from './users.dbService'

export type CreateUserInput = {
  email: string
  password: string
  name: string
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersDbService: UsersDbService,
    private readonly configService: ConfigService,
  ) {}

  findById(userId: string): User | undefined {
    return this.usersDbService.findById(userId)
  }

  list(): User[] {
    return this.usersDbService.list()
  }

  findByEmail(email: string): StoredUser | undefined {
    return this.usersDbService.findByEmail(email)
  }

  async create(input: CreateUserInput): Promise<User> {
    if (this.usersDbService.findByEmail(input.email) !== undefined) {
      throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'An account with this email already exists')
    }

    const bcryptRounds = this.configService.getOrThrow<number>('BCRYPT_ROUNDS')
    const passwordHash = await bcrypt.hash(input.password, bcryptRounds)
    const stored = this.usersDbService.create({
      name: input.name,
      email: input.email,
      passwordHash,
    })
    return toPublicUser(stored)
  }
}
