import { Injectable } from '@nestjs/common'
import type { User } from '@chat/contract'
import { UsersService } from '../../users/users.service'
import { EmailChangeTokenService } from '../email-change-token.service'
import type { ConfirmEmailChangeDto } from '../dto/confirm-email-change.dto'

@Injectable()
export class ConfirmEmailChangeOrchestrator {
  constructor(
    private readonly tokenService: EmailChangeTokenService,
    private readonly usersService: UsersService,
  ) {}

  async execute(dto: ConfirmEmailChangeDto): Promise<User> {
    const { userId, newEmail } = await this.tokenService.verify(dto.token)
    return this.usersService.changeEmail(userId, newEmail)
  }
}
