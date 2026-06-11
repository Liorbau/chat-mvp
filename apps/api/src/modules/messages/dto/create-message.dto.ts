import { IsString, Length } from 'class-validator'
import { Trim } from '../../../common/decorators/trim.decorator'

export class CreateMessageDto {
  @Trim()
  @IsString()
  @Length(1, 2000)
  content!: string
}
