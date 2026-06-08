import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validate } from '../../middleware/validate'
import {
  createConversationController,
  listConversationsController,
} from './conversations.controller'
import { createConversationSchema } from '../../validation/createConversation.schema'

export const conversationsRouter = Router()

conversationsRouter.use(authenticate)

conversationsRouter.get('/', listConversationsController)
conversationsRouter.post(
  '/',
  validate(createConversationSchema, 'body'),
  createConversationController,
)
