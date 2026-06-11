import { IsEmail, IsString, Length, MinLength } from 'class-validator'

export class SignupDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string

  @IsString()
  @Length(1, 100)
  name!: string
}
