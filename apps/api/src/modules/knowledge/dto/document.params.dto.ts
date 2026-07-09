import { IsString, MinLength } from 'class-validator'
import { Trim } from '../../../common/decorators/trim.decorator'

export class DocumentParamsDto {
  @Trim()
  @IsString()
  @MinLength(1)
  id!: string
}
