import { sendMessage as sendMessageRequest } from '../api/apiClient'
import type { MessagesDispatch } from '../state/messagesReducer'
import { createTemporaryMessage } from './optimisticMessages.tempMessage'

type SendOptimisticMessageParameters = {
  conversationId: string | null
  content: string
  dispatch: MessagesDispatch
}

export async function sendOptimisticMessage({
  conversationId,
  content,
  dispatch,
}: SendOptimisticMessageParameters): Promise<void> {
  const normalizedContent = content.trim()
  if (conversationId === null || normalizedContent.length === 0) {
    return
  }

  const temporaryMessage = createTemporaryMessage(conversationId, normalizedContent)
  dispatch({
    type: 'SEND_START',
    payload: { message: temporaryMessage },
  })

  try {
    const response = await sendMessageRequest({
      conversationId,
      content: normalizedContent,
    })

    dispatch({
      type: 'SEND_SUCCESS',
      payload: {
        tempId: temporaryMessage.id,
        message: response.message,
      },
    })
  } catch {
    dispatch({
      type: 'SEND_FAILURE',
      payload: {
        tempId: temporaryMessage.id,
        error: 'Failed to send message',
      },
    })
    throw new Error('Failed to send message')
  }
}
