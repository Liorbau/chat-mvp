import { ASSISTANT_SENDER_ID, type AssistantSseEvent } from '@chat/contract'
import type { AssistantAction } from '@/features/ai/state/assistantChatReducer'

type AssistantDispatch = (action: AssistantAction) => void

// Pure mapping from an SSE frame to a reducer action. `tool_result` is
// intentionally ignored (the tool-call label persists until tokens start).
export function handleAssistantEvent(
  dispatch: AssistantDispatch,
  event: AssistantSseEvent,
  tempId: string,
): void {
  switch (event.type) {
    case 'user_message':
      dispatch({ type: 'USER_MESSAGE', payload: { tempId, message: event.message } })
      return
    case 'tool_call':
      dispatch({ type: 'TOOL_CALL', payload: { label: event.label } })
      return
    case 'token':
      dispatch({ type: 'TOKEN', payload: { value: event.value } })
      return
    case 'done':
      dispatch({
        type: 'DONE',
        payload: {
          messageId: event.messageId,
          senderId: ASSISTANT_SENDER_ID,
          createdAt: new Date().toISOString(),
          citations: event.citations,
        },
      })
      return
    case 'error':
      dispatch({ type: 'STREAM_ERROR', payload: { error: event.message, tempId } })
      return
  }
}
