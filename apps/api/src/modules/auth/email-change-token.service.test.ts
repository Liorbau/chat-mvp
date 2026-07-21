import type { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { describe, expect, it } from 'vitest'
import { EmailChangeTokenService } from './email-change-token.service'

const SECRET = 'unit-email-change-secret-at-least-32-chars'

function makeService(secret: string = SECRET, ttl: string = '30m'): EmailChangeTokenService {
  const config = {
    getOrThrow: (key: string): string => (key === 'EMAIL_CHANGE_TOKEN_SECRET' ? secret : ttl),
  } as unknown as ConfigService
  return new EmailChangeTokenService(new JwtService({}), config)
}

describe('EmailChangeTokenService', () => {
  it('signs a token that verifies back to the same payload', async () => {
    const service = makeService()
    const token = await service.sign({ userId: 'u1', newEmail: 'new@example.com' })

    await expect(service.verify(token)).resolves.toEqual({
      userId: 'u1',
      newEmail: 'new@example.com',
    })
  })

  it('rejects a token signed with a different secret (no cross-secret replay)', async () => {
    const signer = makeService('a-totally-different-secret-32-chars-min')
    const verifier = makeService()
    const token = await signer.sign({ userId: 'u1', newEmail: 'new@example.com' })

    await expect(verifier.verify(token)).rejects.toThrow()
  })

  it('rejects an expired token', async () => {
    const service = makeService(SECRET, '-1s')
    const token = await service.sign({ userId: 'u1', newEmail: 'new@example.com' })

    await expect(service.verify(token)).rejects.toThrow()
  })

  it('rejects a malformed token', async () => {
    await expect(makeService().verify('not-a-jwt')).rejects.toThrow()
  })
})
