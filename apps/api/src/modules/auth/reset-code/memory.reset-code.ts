import { RESET_CODE_TTL_SECONDS } from './reset-code.constants'
import type { ResetCodeProvider } from './reset-code.provider'

type Entry = {
  codeHash: string
  expiresAt: number
}

export class MemoryResetCodeProvider implements ResetCodeProvider {
  private readonly codes = new Map<string, Entry>()

  store(userId: string, codeHash: string): Promise<string> {
    this.codes.set(userId, { codeHash, expiresAt: Date.now() + RESET_CODE_TTL_SECONDS * 1000 })
    return Promise.resolve(codeHash)
  }

  find(userId: string): Promise<string | undefined> {
    return Promise.resolve(this.read(userId))
  }

  consume(userId: string): Promise<boolean> {
    const existing = this.read(userId)
    this.codes.delete(userId)
    return Promise.resolve(Boolean(existing))
  }

  private read(userId: string): string | undefined {
    const entry = this.codes.get(userId)
    if (!entry) {
      return undefined
    }
    if (entry.expiresAt <= Date.now()) {
      this.codes.delete(userId)
      return undefined
    }
    return entry.codeHash
  }
}
