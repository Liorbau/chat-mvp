import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'

export function notFound(_request: Request, _response: Response, next: NextFunction): void {
  next(AppError.notFound('Route not found'))
}
