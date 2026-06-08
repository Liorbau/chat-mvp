import { z } from 'zod'

export const createMessageBodySchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, { message: 'content must not be empty' })
      .max(2000, { message: 'content must be at most 2000 characters' }),
  })
  .strict()

export type CreateMessageBody = z.infer<typeof createMessageBodySchema>
