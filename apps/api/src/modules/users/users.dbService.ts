import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import type { User } from '@chat/contract'
import type { Model } from 'mongoose'
import { buildAvatarKey } from '../storage/storage.constants'
import { User as UserModel, type UserDocument } from './user.schema'

export type StoredUser = {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  // Cache-bust token for the fixed avatar key. null = no avatar.
  avatarVersion: string | null
}
export type StoredUserDraft = Omit<StoredUser, 'id'>

function toStoredUser(doc: UserDocument): StoredUser {
  return {
    id: doc._id,
    name: doc.name,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    passwordHash: doc.passwordHash,
    avatarVersion: doc.avatarVersion ?? null,
  }
}

// The avatar lives at a fixed per-user key; the version query-param busts the CDN
// cache when it's replaced. Fails visibly if the base URL is unconfigured.
export function toPublicUser(user: StoredUser, avatarBaseUrl: string | undefined): User {
  let avatarUrl: string | null = null
  if (user.avatarVersion !== null) {
    if (avatarBaseUrl === undefined || avatarBaseUrl === '') {
      throw new Error('STORAGE_PUBLIC_BASE_URL is not configured but a user has an avatar')
    }
    avatarUrl = `${avatarBaseUrl}/${buildAvatarKey(user.id)}?v=${user.avatarVersion}`
  }
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl,
  }
}

export type UserUpdate = Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'name' | 'email'>>

@Injectable()
export class UsersDbService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  private avatarBaseUrl(): string | undefined {
    return this.configService.get<string>('STORAGE_PUBLIC_BASE_URL')
  }

  private toPublic(stored: StoredUser): User {
    return toPublicUser(stored, this.avatarBaseUrl())
  }

  async list(): Promise<User[]> {
    const docs = await this.userModel.find().exec()
    return docs.map(toStoredUser).map((stored) => this.toPublic(stored))
  }

  async findById(userId: string): Promise<User | undefined> {
    const doc = await this.userModel.findById(userId).exec()
    return doc === null ? undefined : this.toPublic(toStoredUser(doc))
  }

  async findByEmail(email: string): Promise<StoredUser | undefined> {
    const doc = await this.userModel.findOne({ email: email.trim().toLowerCase() }).exec()
    return doc === null ? undefined : toStoredUser(doc)
  }

  async findExistingIds(userIds: string[]): Promise<Set<string>> {
    const docs = await this.userModel.find({ _id: { $in: userIds } }, { _id: 1 }).exec()
    return new Set(docs.map((doc) => doc._id))
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) {
      return []
    }
    const docs = await this.userModel.find({ _id: { $in: userIds } }).exec()
    return docs.map(toStoredUser).map((stored) => this.toPublic(stored))
  }

  async create(draft: StoredUserDraft): Promise<StoredUser> {
    const doc = await this.userModel.create({
      _id: randomUUID(),
      name: draft.name,
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      passwordHash: draft.passwordHash,
      avatarVersion: draft.avatarVersion,
    })
    return toStoredUser(doc)
  }

  async update(userId: string, changes: UserUpdate): Promise<User | undefined> {
    const doc = await this.userModel
      .findByIdAndUpdate(userId, { $set: changes }, { returnDocument: 'after' })
      .exec()
    return doc === null ? undefined : this.toPublic(toStoredUser(doc))
  }

  // Sets a fresh version (avatar present) or null (removed). Returns the updated
  // public user, or undefined if the user no longer exists.
  async setAvatarVersion(userId: string, avatarVersion: string | null): Promise<User | undefined> {
    const doc = await this.userModel
      .findByIdAndUpdate(userId, { $set: { avatarVersion } }, { returnDocument: 'after' })
      .exec()
    return doc === null ? undefined : this.toPublic(toStoredUser(doc))
  }

  async reset(users: StoredUser[]): Promise<void> {
    await this.userModel.deleteMany({})
    if (users.length > 0) {
      await this.userModel.insertMany(
        users.map((user) => ({
          _id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          passwordHash: user.passwordHash,
          avatarVersion: user.avatarVersion,
        })),
      )
    }
  }
}
