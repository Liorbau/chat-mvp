import { plainToInstance } from 'class-transformer'
import { IsInt, IsString, Min, MinLength, validateSync } from 'class-validator'

export class EnvironmentVariables {
  @IsString()
  @MinLength(1)
  JWT_SECRET!: string

  @IsInt()
  @Min(4)
  BCRYPT_ROUNDS!: number

  @IsString()
  @MinLength(1)
  JWT_EXPIRES_IN: string = '1h'

  @IsInt()
  @Min(1)
  PORT: number = 4000

  @IsString()
  @MinLength(1)
  CORS_ORIGIN: string = 'http://localhost:5173'
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validated, { skipMissingProperties: false })
  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.toString()}`)
  }

  return validated
}
