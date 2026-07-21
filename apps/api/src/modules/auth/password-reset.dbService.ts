import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { PasswordReset, type PasswordResetDocument } from './password-reset.schema'

export type StoredResetCode = {
  codeHash: string
  expiresAt: Date
}

@Injectable()
export class PasswordResetDbService {
  constructor(
    @InjectModel(PasswordReset.name)
    private readonly passwordResetModel: Model<PasswordResetDocument>,
  ) {}

  async findByUserId(userId: string): Promise<StoredResetCode | undefined> {
    const doc = await this.passwordResetModel.findOne({ userId }).exec()
    return doc == null ? undefined : { codeHash: doc.codeHash, expiresAt: doc.expiresAt }
  }

  async store(userId: string, codeHash: string, expiresAt: Date): Promise<StoredResetCode> {
    await this.passwordResetModel
      .findOneAndUpdate(
        { userId },
        { $set: { codeHash, expiresAt }, $setOnInsert: { _id: randomUUID() } },
        { upsert: true },
      )
      .exec()
    return { codeHash, expiresAt }
  }

  // Consumes the code. true => a row existed and was removed.
  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.passwordResetModel.deleteOne({ userId }).exec()
    return result.deletedCount === 1
  }
}
