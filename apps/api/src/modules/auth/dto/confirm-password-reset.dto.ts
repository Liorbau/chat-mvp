import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator'
import type { ConfirmPasswordResetRequest } from '@chat/contract'
import { Lowercase } from '../../../common/decorators/lowercase.decorator'
import { Trim } from '../../../common/decorators/trim.decorator'
import { RESET_CODE_LENGTH } from '../lib/reset-code'

export class ConfirmPasswordResetDto implements ConfirmPasswordResetRequest {
  @Trim()
  @Lowercase()
  @IsEmail()
  email!: string

  @Trim()
  @IsString()
  @Length(RESET_CODE_LENGTH, RESET_CODE_LENGTH)
  @Matches(/^\d+$/, { message: 'code must be numeric' })
  code!: string

  @IsString()
  @MinLength(8)
  newPassword!: string
}
