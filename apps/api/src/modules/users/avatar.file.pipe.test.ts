import { describe, expect, it } from 'vitest'
import { AppError } from '../../errors/AppError'
import { AvatarFilePipe } from './avatar.file.pipe'

function multerFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    buffer: Buffer.from('img'),
    mimetype: 'image/png',
    size: 3,
    ...overrides,
  } as Express.Multer.File
}

describe('AvatarFilePipe', () => {
  const pipe = new AvatarFilePipe()

  it('maps a multipart file to a framework-agnostic AvatarUpload', () => {
    const upload = pipe.transform(multerFile())

    expect(upload).toEqual({ buffer: Buffer.from('img'), mimeType: 'image/png', size: 3 })
  })

  it('rejects a missing file with a 400 VALIDATION_ERROR', () => {
    expect(() => pipe.transform(undefined)).toThrow(AppError)
  })
})
