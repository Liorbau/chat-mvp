import { useCallback, type Dispatch, type MutableRefObject } from 'react'
import { streamAssistant } from '../apiActions/ai'
import type { AssistantAction, AssistantState } from '@/features/ai/state/assistantChatReducer'
import { handleAssistantEvent } from './handleAssistantEvent'

export function useSendAssistantMessage(
  state: AssistantState,
  dispatch: Dispatch<AssistantAction>,
  currentUserId: string,
  abortRef: MutableRefObject<AbortController | null>,
): (content: string) => void {
  return useCallback(
    (content: string) => {
      const conversationId = state.conversationId
      if (conversationId == null || state.isStreaming) {
        return
      }
      const tempId = `temp-${String(Date.now())}`
      dispatch({
        type: 'SEND_START',
        payload: {
          optimistic: {
            id: tempId,
            conversationId,
            senderId: currentUserId,
            content,
            createdAt: new Date().toISOString(),
          },
        },
      })

      const controller = new AbortController()
      abortRef.current = controller

      void streamAssistant(
        conversationId,
        content,
        (event) => {
          handleAssistantEvent(dispatch, event, tempId)
        },
        controller.signal,
      )
        .catch(() => {
          if (controller.signal.aborted) {
            return
          }
          dispatch({
            type: 'STREAM_ERROR',
            payload: { error: 'The assistant failed to respond.', tempId },
          })
        })
        .finally(() => {
          if (controller.signal.aborted) {
            return
          }
          dispatch({ type: 'STREAM_END' })
        })
    },
    [state.conversationId, state.isStreaming, currentUserId, dispatch, abortRef],
  )
}
