import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { Lowercase } from '../../../common/decorators/lowercase.decorator'
import { Trim } from '../../../common/decorators/trim.decorator'

export class LoginDto {
  // Canonicalize the email at the edge so login matches the value stored at signup.
  @Trim()
  @Lowercase()
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  password!: string
}
