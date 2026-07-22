import { ASSISTANT_SENDER_ID } from '@chat/contract'
import {
  BASE_BUBBLE_STYLE,
  MINE_BUBBLE_COLORS,
  OTHER_BUBBLE_COLORS,
  ROW_STYLE,
  SENDER_LABEL_STYLE,
} from './TutorPanel.styles'
import { TutorSources } from './TutorSources'
import type { TutorMessageProps } from './TutorPanel.types'

export function TutorMessage({ message, currentUserId }: TutorMessageProps) {
  const mine = message.senderId === currentUserId
  const who = message.senderId === ASSISTANT_SENDER_ID ? 'Tutor' : mine ? 'You' : message.senderId

  return (
    <div className={`${ROW_STYLE} ${mine ? 'justify-start' : 'justify-end'}`}>
      <div className={`${BASE_BUBBLE_STYLE} ${mine ? MINE_BUBBLE_COLORS : OTHER_BUBBLE_COLORS}`}>
        <span className={SENDER_LABEL_STYLE}>{who}</span>
        {message.content}
        {message.citations && message.citations.length > 0 ? (
          <TutorSources citations={message.citations} />
        ) : null}
      </div>
    </div>
  )
}
