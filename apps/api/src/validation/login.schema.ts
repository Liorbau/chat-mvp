import { z } from 'zod'

export const loginBodySchema = z
  .object({
    userId: z.string().trim().min(1),
  })
  .strict()

export type LoginBody = z.infer<typeof loginBodySchema>
