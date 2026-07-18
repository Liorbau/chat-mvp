import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { User } from '@chat/contract'
import type { Model } from 'mongoose'
import { User as UserModel, type UserDocument } from './user.schema'
import {
  toPublicUser,
  toStoredUser,
  type StoredAvatar,
  type StoredUser,
  type StoredUserDraft,
  type UserUpdate,
} from './user.mapper'

@Injectable()
export class UsersDbService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async list(): Promise<User[]> {
    const docs = await this.userModel.find().exec()
    return docs.map(toStoredUser).map(toPublicUser)
  }

  async findById(userId: string): Promise<User | undefined> {
    const doc = await this.userModel.findById(userId).exec()
    return doc === null ? undefined : toPublicUser(toStoredUser(doc))
  }

  async findStoredById(userId: string): Promise<StoredUser | undefined> {
    const doc = await this.userModel.findById(userId).exec()
    return doc === null ? undefined : toStoredUser(doc)
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
    return docs.map(toStoredUser).map(toPublicUser)
  }

  async create(draft: StoredUserDraft): Promise<StoredUser> {
    const doc = await this.userModel.create({
      _id: randomUUID(),
      name: draft.name,
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      passwordHash: draft.passwordHash,
      avatar: draft.avatar,
    })
    return toStoredUser(doc)
  }

  async update(userId: string, changes: UserUpdate): Promise<User | undefined> {
    const doc = await this.userModel
      .findByIdAndUpdate(userId, { $set: changes }, { returnDocument: 'after' })
      .exec()
    return doc === null ? undefined : toPublicUser(toStoredUser(doc))
  }

  async setAvatar(userId: string, avatar: StoredAvatar | null): Promise<User | undefined> {
    const doc = await this.userModel
      .findByIdAndUpdate(userId, { $set: { avatar } }, { returnDocument: 'after' })
      .exec()
    return doc === null ? undefined : toPublicUser(toStoredUser(doc))
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
          avatar: user.avatar,
        })),
      )
    }
  }
}
