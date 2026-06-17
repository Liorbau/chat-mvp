import { ArrayMinSize, IsArray, IsOptional, IsString, Length, MinLength } from 'class-validator'
import { Trim, TrimEach } from '../../../common/decorators/trim.decorator'

export class CreateConversationDto {
  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 100)
  title?: string

  @TrimEach()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  participantIds!: string[]
}
