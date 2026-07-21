import { IsEmail } from 'class-validator'
import type { RequestPasswordResetRequest } from '@chat/contract'
import { Lowercase } from '../../../common/decorators/lowercase.decorator'
import { Trim } from '../../../common/decorators/trim.decorator'

export class RequestPasswordResetDto implements RequestPasswordResetRequest {
  @Trim()
  @Lowercase()
  @IsEmail()
  email!: string
}
