import { describe, expect, it } from 'vitest'
import { detectImageMime } from './image.signature'

const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP')])

describe('detectImageMime', () => {
  it('detects PNG from its signature', () => {
    expect(detectImageMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      'image/png',
    )
  })

  it('detects JPEG from its signature', () => {
    expect(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
  })

  it('detects WebP from its RIFF/WEBP signature', () => {
    expect(detectImageMime(webp)).toBe('image/webp')
  })

  it('returns null for a non-image', () => {
    expect(detectImageMime(Buffer.from('this is not an image'))).toBeNull()
  })
})
