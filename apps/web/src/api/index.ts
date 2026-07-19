export { ApiRequestError } from './apiClient'
export { login, signup } from './auth.api'
export { getUsers } from './users.api'
export { getConversations, createConversation } from './conversations.api'
export { getMessages, sendMessage } from './messages.api'
export { streamAssistant } from './ai.api'
export {
  deleteKnowledgeDocument,
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
} from './knowledge.api'
export { updateProfile, uploadAvatar, removeAvatar } from './profile.api'
export type { CreateConversationInput } from './types'
