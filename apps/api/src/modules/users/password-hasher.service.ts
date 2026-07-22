import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import bcrypt from 'bcrypt'

@Injectable()
export class PasswordHasher {
  private readonly rounds: number

  constructor(configService: ConfigService) {
    this.rounds = configService.getOrThrow<number>('BCRYPT_ROUNDS')
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }
}
