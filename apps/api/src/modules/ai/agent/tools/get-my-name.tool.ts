import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import type { UsersService } from '../../../users/users.service'
import { requesterIdFromConfig } from './tool-context'

export function buildGetMyNameTool(usersService: UsersService) {
  return tool(
    async (_input, config) => {
      // Scoped to the JWT requesterId; returns only the name, never id/email/hash.
      const user = await usersService.findById(requesterIdFromConfig(config))
      return user === undefined
        ? 'Your account could not be found.'
        : JSON.stringify({ name: user.name })
    },
    {
      name: 'get_my_name',
      description: 'Get the display name of the current user (the person you are talking to).',
      schema: z.object({}),
    },
  )
}
