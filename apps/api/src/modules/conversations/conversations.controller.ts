import type { NextFunction, Request, Response } from 'express'
import { requireAuthenticatedUser } from '../../middleware/authenticate'
import { getValidated } from '../../middleware/validate'
import type { CreateConversationInput } from './conversations.service'
import { createConversation, listConversations } from './conversations.service'

export function listConversationsController(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const userId = requireAuthenticatedUser(request)
    const conversations = listConversations(userId)
    response.status(200).json(conversations)
  } catch (error: unknown) {
    next(error)
  }
}

export function createConversationController(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const userId = requireAuthenticatedUser(request)
    const payload = getValidated<CreateConversationInput>(request)
    const conversation = createConversation(payload, userId)
    response.location(`/conversations/${conversation.id}`).status(201).json(conversation)
  } catch (error: unknown) {
    next(error)
  }
}
