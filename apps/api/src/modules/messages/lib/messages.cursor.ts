import { AppError } from '../../../errors/AppError'
import type { MessagePageCursor } from '../messages.dbService'

// The cursor id is a message's uuid `_id`.
const CURSOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function encodeCursor(key: MessagePageCursor): string {
  return Buffer.from(`${key.createdAt}|${key.id}`, 'utf8').toString('base64')
}

export function decodeCursor(cursor: string | undefined): MessagePageCursor | undefined {
  if (cursor === undefined) {
    return undefined
  }

  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8')
    const [createdAt, id, extra] = decoded.split('|')
    if (
      createdAt === undefined ||
      createdAt.length === 0 ||
      id === undefined ||
      !CURSOR_ID_PATTERN.test(id) ||
      extra !== undefined
    ) {
      throw new Error('Invalid cursor')
    }

    return { createdAt, id }
  } catch {
    throw AppError.badRequest('VALIDATION_ERROR', 'Invalid request', [
      { path: ['cursor'], message: 'cursor is invalid' },
    ])
  }
}
