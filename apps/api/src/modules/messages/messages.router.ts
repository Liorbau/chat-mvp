import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validate } from '../../middleware/validate'
import { createMessageController, listMessagesController } from './messages.controller'
import { createMessageBodySchema } from '../../validation/createMessage.schema'
import {
  conversationParamsSchema,
  listMessagesQuerySchema,
} from '../../validation/listMessages.schema'

export const messagesRouter = Router({ mergeParams: true })

messagesRouter.use(authenticate)
messagesRouter.use(validate(conversationParamsSchema, 'params'))

messagesRouter.get('/', validate(listMessagesQuerySchema, 'query'), listMessagesController)
messagesRouter.post('/', validate(createMessageBodySchema, 'body'), createMessageController)
