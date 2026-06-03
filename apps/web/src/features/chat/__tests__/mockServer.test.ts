import { beforeEach, describe, expect, it } from 'vitest'
import { setSessionUserId } from '../auth/authSession'
import {
  mockGetConversations,
  mockGetMessages,
  mockLogin,
  mockPostMessage,
} from '../mocks/mockServer'

beforeEach(() => {
  setSessionUserId(null)
})

describe('mockServer.mockGetConversations (sorting contract)', () => {
  it('returns conversations sorted by updatedAt descending', async () => {
    const conversations = await mockGetConversations()

    const isDescending = conversations.every((conversation, index) => {
      if (index === 0) {
        return true
      }
      const previousUpdatedAt = conversations[index - 1]?.updatedAt ?? ''
      return previousUpdatedAt.localeCompare(conversation.updatedAt) >= 0
    })

    expect(isDescending).toBe(true)
  })

  it('filters conversations to the logged-in participant', async () => {
    await mockLogin({ email: 'sam@example.com', password: 'ignored' })

    const conversations = await mockGetConversations()

    expect(conversations.length).toBeGreaterThan(0)
    const allVisibleToCurrentUser = conversations.every((conversation) => {
      return conversation.participantIds.includes('user-2')
    })
    expect(allVisibleToCurrentUser).toBe(true)
  })
})

describe('mockServer.mockLogin', () => {
  it('returns token and user for valid credentials', async () => {
    const response = await mockLogin({ email: 'alex@example.com', password: 'ignored' })

    expect(response.user.id).toBe('user-1')
    expect(response.token).toContain('user-1')
  })

  it('rejects invalid credentials', async () => {
    await expect(
      mockLogin({ email: 'unknown@example.com', password: 'ignored' }),
    ).rejects.toThrowError('Invalid credentials')
  })
})

describe('mockServer.mockGetMessages (cursor pagination)', () => {
  it('returns the latest page first and exposes a non-null cursor when older pages remain', async () => {
    const firstPage = await mockGetMessages('conv-1')

    expect(firstPage.messages.length).toBeGreaterThan(0)
    expect(firstPage.nextCursor).not.toBeNull()
    const isAscending = firstPage.messages.every((message, index) => {
      if (index === 0) {
        return true
      }
      const previousCreatedAt = firstPage.messages[index - 1]?.createdAt ?? ''
      return previousCreatedAt.localeCompare(message.createdAt) <= 0
    })
    expect(isAscending).toBe(true)
  })

  it('walks all pages with the returned cursor until nextCursor becomes null', async () => {
    let cursor: string | undefined = undefined
    const collectedIds: string[] = []
    let safetyCounter = 0

    do {
      const page = await mockGetMessages('conv-1', cursor)
      collectedIds.unshift(...page.messages.map((message) => message.id))
      cursor = page.nextCursor === null ? undefined : page.nextCursor
      safetyCounter += 1
      if (safetyCounter > 10) {
        throw new Error('Pagination did not terminate, contract violation')
      }
    } while (cursor !== undefined)

    expect(collectedIds.length).toBeGreaterThan(0)
    const uniqueIds = new Set(collectedIds)
    expect(uniqueIds.size).toBe(collectedIds.length)
  })

  it('returns an empty page and a null cursor for unknown conversations (edge case)', async () => {
    const result = await mockGetMessages('conv-does-not-exist')

    expect(result.messages).toEqual([])
    expect(result.nextCursor).toBeNull()
  })
})

describe('mockServer.mockPostMessage (mutation edge cases)', () => {
  it('rejects when the conversation does not exist', async () => {
    await expect(
      mockPostMessage({ conversationId: 'conv-does-not-exist', content: 'hi' }),
    ).rejects.toThrowError('Conversation not found')
  })

  it('rejects when the content is empty or whitespace-only', async () => {
    await expect(
      mockPostMessage({ conversationId: 'conv-1', content: '   ' }),
    ).rejects.toThrowError('Message content is required')
  })

  it('rejects when the content explicitly triggers the simulated failure path', async () => {
    await expect(
      mockPostMessage({ conversationId: 'conv-1', content: 'please fail' }),
    ).rejects.toThrowError('Failed to send message')
  })
})
