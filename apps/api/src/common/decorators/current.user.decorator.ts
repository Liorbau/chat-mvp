import { createParamDecorator, UnauthorizedException, type ExecutionContext } from '@nestjs/common'
import type { User } from '@chat/contract'

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<{ user?: User }>()
    if (!request.user) {
      throw new UnauthorizedException('Not authenticated')
    }

    return request.user
  },
)
