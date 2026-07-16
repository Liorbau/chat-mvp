import { IsEmail, IsString, Length, MinLength } from 'class-validator'
import { Lowercase } from '../../../common/decorators/lowercase.decorator'
import { Trim } from '../../../common/decorators/trim.decorator'

export class SignupDto {
  // Canonicalize the email at the edge: emails identify a real (case-insensitive)
  // mailbox, so every downstream consumer works with the same normalized value.
  @Trim()
  @Lowercase()
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string

  @Trim()
  @IsString()
  @Length(1, 100)
  firstName!: string

  @Trim()
  @IsString()
  @Length(1, 100)
  lastName!: string
}
