import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MinLength,
  ValidateIf,
} from 'class-validator'
import type { ConversationType } from '@chat/contract'
import { Trim, TrimEach } from '../../../common/decorators/trim.decorator'

export class CreateConversationDto {
  // Defaults to 'user' in the service when omitted.
  @IsOptional()
  @IsIn(['user', 'assistant'])
  type?: ConversationType

  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 100)
  title?: string

  // Required for 'user' conversations (need the other participant); ignored for
  // 'assistant' conversations, whose only participant is the creator.
  @ValidateIf((dto: CreateConversationDto) => dto.type !== 'assistant')
  @TrimEach()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  participantIds?: string[]
}
