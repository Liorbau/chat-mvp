import type { Conversation } from '@chat/contract'

// A conversation enriched by the container with the display fields the list needs:
// the derived title plus the counterpart's resolved avatar + name. Keeps the
// list item a pure leaf that reads ready values.
export type DisplayConversation = Conversation & {
  avatarUrl: string | null
  avatarName: string
}
