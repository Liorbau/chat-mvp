import type { NextFunction, Request, Response } from 'express'
import { requireAuthenticatedToken } from '../../middleware/authenticate'
import { getValidated } from '../../middleware/validate'
import type { LoginBody } from '../../validation/login.schema'
import { loginUser, logoutUser } from './auth.service'

export function login(request: Request, response: Response, next: NextFunction): void {
  try {
    const { userId } = getValidated<LoginBody>(request)
    const result = loginUser(userId)
    response.status(200).json(result)
  } catch (error: unknown) {
    next(error)
  }
}

export function logout(request: Request, response: Response, next: NextFunction): void {
  try {
    const token = requireAuthenticatedToken(request)
    logoutUser(token)
    response.status(204).send()
  } catch (error: unknown) {
    next(error)
  }
}
