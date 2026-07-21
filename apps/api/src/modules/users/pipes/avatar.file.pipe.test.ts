import { describe, expect, it } from 'vitest'
import { HttpAppError } from '../../../errors/HttpAppError'
import { AvatarFilePipe } from './avatar.file.pipe'

const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function multerFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    buffer: PNG_BYTES,
    mimetype: 'image/png',
    size: PNG_BYTES.length,
    ...overrides,
  } as Express.Multer.File
}

describe('AvatarFilePipe', () => {
  const pipe = new AvatarFilePipe()

  it('maps a valid image to an AvatarUpload with the detected type', () => {
    const upload = pipe.transform(multerFile())

    expect(upload).toEqual({ buffer: PNG_BYTES, mimeType: 'image/png', size: PNG_BYTES.length })
  })

  it('rejects a mislabeled non-image (claimed image/png) with a 400', () => {
    const notAnImage = multerFile({ buffer: Buffer.from('this is not an image') })

    expect(() => pipe.transform(notAnImage)).toThrow(HttpAppError)
  })

  it('rejects a missing file with a 400 VALIDATION_ERROR', () => {
    expect(() => pipe.transform(undefined)).toThrow(HttpAppError)
  })

  it('rejects a file over the size limit with a 400', () => {
    const tooBig = multerFile({ size: 6 * 1024 * 1024 })

    expect(() => pipe.transform(tooBig)).toThrow(HttpAppError)
  })
})
