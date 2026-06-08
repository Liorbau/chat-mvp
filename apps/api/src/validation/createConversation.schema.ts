import { z } from 'zod'

const participantIdSchema = z.string().trim().min(1, 'participantIds cannot contain empty values')

export const createConversationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'title is required')
      .max(100, 'title must be at most 100 characters'),
    participantIds: z
      .array(participantIdSchema)
      .min(1, 'participantIds must include at least one participant'),
  })
  .strict()
