import type { NextFunction, Request, Response } from 'express'
import { requireAuthenticatedUser } from '../../middleware/authenticate'
import { getValidated } from '../../middleware/validate'
import type { CreateMessageBody } from '../../validation/createMessage.schema'
import {
  type ConversationParams,
  type ListMessagesQuery,
} from '../../validation/listMessages.schema'
import { createMessage, listMessages } from './messages.service'

export function listMessagesController(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const params = getValidated<ConversationParams>(request, 'params')
    const query = getValidated<ListMessagesQuery>(request, 'query')
    const result = listMessages({
      conversationId: params.id,
      requesterId: requireAuthenticatedUser(request),
      cursor: query.cursor,
      limit: query.limit,
    })
    response.status(200).json(result)
  } catch (error: unknown) {
    next(error)
  }
}

export function createMessageController(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const params = getValidated<ConversationParams>(request, 'params')
    const body = getValidated<CreateMessageBody>(request, 'body')
    const result = createMessage({
      conversationId: params.id,
      requesterId: requireAuthenticatedUser(request),
      content: body.content,
    })
    response.status(201).json(result)
  } catch (error: unknown) {
    next(error)
  }
}
