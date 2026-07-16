import { IsEmail, IsOptional, IsString, Length } from 'class-validator'
import type { UpdateProfileRequest } from '@chat/contract'
import { Lowercase } from '../../../common/decorators/lowercase.decorator'
import { Trim } from '../../../common/decorators/trim.decorator'

// Every field is optional: the name form sends firstName+lastName, the email form
// sends email. An all-empty body is rejected in the service (fail visibly), not here.
export class UpdateProfileDto implements UpdateProfileRequest {
  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 100)
  firstName?: string

  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 100)
  lastName?: string

  @IsOptional()
  @Trim()
  @Lowercase()
  @IsEmail()
  email?: string
}
