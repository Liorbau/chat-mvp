import { IsNotEmpty, IsString } from 'class-validator'
import type { ConfirmEmailChangeRequest } from '@chat/contract'

export class ConfirmEmailChangeDto implements ConfirmEmailChangeRequest {
  @IsString()
  @IsNotEmpty()
  token!: string
}
