import { IsOptional, IsString, Length } from 'class-validator'
import type { UpdateProfileRequest } from '@chat/contract'
import { Trim } from '../../../common/decorators/trim.decorator'

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
}
