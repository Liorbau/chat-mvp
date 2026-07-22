import type { OnModuleDestroy } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { RESET_CODE_TTL_SECONDS } from './reset-code.constants'
import type { ResetCodeProvider } from './reset-code.provider'

function keyFor(userId: string): string {
  return `password-reset:${userId}`
}

export class RedisResetCodeProvider implements ResetCodeProvider, OnModuleDestroy {
  private readonly client: Redis

  constructor(config: ConfigService) {
    this.client = new Redis(config.getOrThrow<string>('REDIS_URL'))
  }

  async store(userId: string, codeHash: string): Promise<string> {
    await this.client.set(keyFor(userId), codeHash, 'EX', RESET_CODE_TTL_SECONDS)
    return codeHash
  }

  async find(userId: string): Promise<string | undefined> {
    const codeHash = await this.client.get(keyFor(userId))
    return codeHash ?? undefined
  }

  async consume(userId: string): Promise<boolean> {
    const codeHash = await this.client.getdel(keyFor(userId))
    return Boolean(codeHash)
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit()
  }
}
