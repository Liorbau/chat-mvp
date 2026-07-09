import type { RunnableConfig } from '@langchain/core/runnables'
import { describe, expect, it } from 'vitest'
import { requesterIdFromConfig } from './tool-context'

describe('requesterIdFromConfig', () => {
  it('returns the requesterId the server injected', () => {
    const config: RunnableConfig = { configurable: { requesterId: 'u-1' } }
    expect(requesterIdFromConfig(config)).toBe('u-1')
  })

  it('throws when requesterId is missing', () => {
    expect(() => requesterIdFromConfig({ configurable: {} })).toThrow()
  })

  it('throws when there is no configurable at all', () => {
    expect(() => requesterIdFromConfig({})).toThrow()
  })

  it('throws on an empty requesterId', () => {
    expect(() => requesterIdFromConfig({ configurable: { requesterId: '' } })).toThrow()
  })
})
