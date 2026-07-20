import { IsEmail } from 'class-validator'
import type { RequestEmailChangeRequest } from '@chat/contract'
import { Lowercase } from '../../../common/decorators/lowercase.decorator'
import { Trim } from '../../../common/decorators/trim.decorator'

export class RequestEmailChangeDto implements RequestEmailChangeRequest {
  @Trim()
  @Lowercase()
  @IsEmail()
  newEmail!: string
}
