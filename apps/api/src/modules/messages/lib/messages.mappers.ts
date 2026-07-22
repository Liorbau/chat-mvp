import { randomUUID } from 'node:crypto'
import type { Message } from '@chat/contract'
import { type MessageDocument } from '../message.schema'

export type MessageDraft = Omit<Message, 'id'>

export type MessagePageCursor = {
  createdAt: string
  id: string
}

export type MessagePage = {
  messages: Message[]
  nextCursor: MessagePageCursor | null
}

export function toMessage(doc: MessageDocument): Message {
  const message: Message = {
    id: doc._id,
    conversationId: doc.conversationId,
    senderId: doc.senderId,
    content: doc.content,
    createdAt: doc.createdAt.toISOString(),
  }
  return doc.citations ? { ...message, citations: doc.citations } : message
}

export function toMessageDocument(draft: MessageDraft) {
  return {
    _id: randomUUID(),
    conversationId: draft.conversationId,
    senderId: draft.senderId,
    content: draft.content,
    createdAt: new Date(draft.createdAt),
    ...(draft.citations ? { citations: draft.citations } : {}),
  }
}

export function buildPageFilter(conversationId: string, cursor?: MessagePageCursor) {
  if (!cursor) {
    return { conversationId }
  }

  const cursorCreatedAt = new Date(cursor.createdAt)
  return {
    conversationId,
    $or: [
      { createdAt: { $lt: cursorCreatedAt } },
      { createdAt: cursorCreatedAt, _id: { $lt: cursor.id } },
    ],
  }
}

export function toMessagePage(docsDesc: MessageDocument[], limit: number): MessagePage {
  const hasMore = docsDesc.length > limit
  const pageDesc = hasMore ? docsDesc.slice(0, limit) : docsDesc
  const oldestOnPage = pageDesc.at(-1)
  const nextCursor =
    hasMore && oldestOnPage
      ? { createdAt: oldestOnPage.createdAt.toISOString(), id: oldestOnPage._id }
      : null

  return { messages: pageDesc.reverse().map(toMessage), nextCursor }
}
