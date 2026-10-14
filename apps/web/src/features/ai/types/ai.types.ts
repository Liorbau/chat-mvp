import type { ConversationType } from '@chat/contract'

export type AiMode = Exclude<ConversationType, 'user'>
