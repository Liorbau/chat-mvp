import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validate } from '../../middleware/validate'
import { login, logout } from './auth.controller'
import { loginBodySchema } from '../../validation/login.schema'

export const authRouter = Router()

authRouter.post('/login', validate(loginBodySchema, 'body'), login)
authRouter.post('/logout', authenticate, logout)
