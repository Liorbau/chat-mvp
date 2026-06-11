import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { User } from '@chat/contract'

// Reads the authenticated user that JwtStrategy.validate attached to the request.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<{ user: User }>()
    return request.user
  },
)
