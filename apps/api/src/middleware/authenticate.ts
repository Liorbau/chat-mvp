import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { findUserId } from '../dbServices/tokens.dbService'

const BEARER_PREFIX = 'Bearer '

export function authenticate(request: Request, _response: Response, next: NextFunction): void {
  try {
    const header = request.header('authorization')
    if (header === undefined || !header.startsWith(BEARER_PREFIX)) {
      throw AppError.unauthorized('Missing or malformed Authorization header')
    }

    const token = header.slice(BEARER_PREFIX.length).trim()
    const userId = findUserId(token)
    if (userId === undefined) {
      throw AppError.unauthorized('Invalid or expired token')
    }

    request.token = token
    request.userId = userId
    next()
  } catch (error: unknown) {
    next(error)
  }
}

// Ensures request.userId exists.
export function requireAuthenticatedUser(request: Request): string {
  if (request.userId === undefined) {
    throw AppError.unauthorized('Invalid or expired token')
  }

  return request.userId
}

// Ensures request.token exists.
export function requireAuthenticatedToken(request: Request): string {
  if (request.token === undefined) {
    throw AppError.unauthorized('Missing authentication token')
  }

  return request.token
}
