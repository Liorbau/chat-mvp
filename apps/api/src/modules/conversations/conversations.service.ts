import type { Conversation } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import {
  create,
  findDirectByParticipants,
  listByParticipant,
} from '../../dbServices/conversations.dbService'
import { findById as findUserById } from '../../dbServices/users.dbService'

export type CreateConversationInput = {
  title: string
  participantIds: string[]
}

export function listConversations(userId: string): Conversation[] {
  return listByParticipant(userId).sort((left, right) => {
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  })
}

export function createConversation(
  input: CreateConversationInput,
  creatorId: string,
): Conversation {
  const participantIds = [...new Set([...input.participantIds, creatorId])]
  const missingParticipantIds = participantIds.filter((participantId) => {
    return findUserById(participantId) === undefined
  })
  if (missingParticipantIds.length > 0) {
    throw AppError.badRequest('VALIDATION_ERROR', 'One or more participants do not exist', {
      participantIds: missingParticipantIds,
    })
  }

  if (participantIds.length === 2) {
    const existing = findDirectByParticipants(participantIds)
    if (existing !== undefined) {
      throw AppError.conflict(
        'CONVERSATION_ALREADY_EXISTS',
        'A direct conversation for these participants already exists',
      )
    }
  }

  const nowIso = new Date().toISOString()
  return create({
    title: input.title,
    participantIds,
    lastMessagePreview: '',
    updatedAt: nowIso,
  })
}
