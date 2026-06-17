import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'
import { Trim } from '../../../common/decorators/trim.decorator'

export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 50

export class ConversationParamsDto {
  @Trim()
  @IsString()
  @MinLength(1)
  id!: string
}

export class ListMessagesQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  cursor?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT
}
