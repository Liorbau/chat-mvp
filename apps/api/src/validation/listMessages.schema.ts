import { z } from 'zod'
import { env } from '../config/env'

export const conversationParamsSchema = z.object({
  id: z.string().trim().min(1, 'id path param is required'),
})

export const listMessagesQuerySchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().positive('limit must be a positive number').optional(),
  })
  .transform((query) => {
    return {
      cursor: query.cursor,
      limit: query.limit === undefined ? env.DEFAULT_LIMIT : Math.min(query.limit, env.MAX_LIMIT),
    }
  })

export type ConversationParams = z.infer<typeof conversationParamsSchema>
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>
