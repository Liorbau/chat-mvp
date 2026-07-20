import { describe, expect, it } from 'vitest'
import { HttpAppError } from '../../../errors/HttpAppError'
import { DocumentFilePipe } from './document-file.pipe'

function multerFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    originalname: 'notes.md',
    mimetype: 'text/markdown',
    buffer: Buffer.from('# notes'),
    ...overrides,
  } as Express.Multer.File
}

describe('DocumentFilePipe', () => {
  const pipe = new DocumentFilePipe()

  it('maps a multipart file to a framework-agnostic UploadedDocument', () => {
    const upload = pipe.transform(multerFile())

    expect(upload).toEqual({
      name: 'notes.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# notes'),
    })
  })

  it('rejects a missing file with a 400 VALIDATION_ERROR', () => {
    expect(() => pipe.transform(undefined)).toThrow(HttpAppError)
  })

  it('rejects a file over the size limit with a 400', () => {
    const tooBig = multerFile({ size: 6 * 1024 * 1024 })

    expect(() => pipe.transform(tooBig)).toThrow(HttpAppError)
  })
})
