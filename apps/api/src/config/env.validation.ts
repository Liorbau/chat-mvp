import { plainToInstance } from 'class-transformer'
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
  validateSync,
} from 'class-validator'

export type LlmProviderName = 'openai' | 'anthropic'

export class EnvironmentVariables {
  @IsString()
  @MinLength(32)
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

  @IsString()
  @MinLength(1)
  MONGO_URI!: string

  @IsIn(['openai', 'anthropic'])
  LLM_PROVIDER: LlmProviderName = 'openai'

  @ValidateIf((env: EnvironmentVariables) => env.LLM_PROVIDER === 'openai')
  @IsString()
  @MinLength(1)
  OPENAI_API_KEY?: string

  @ValidateIf((env: EnvironmentVariables) => env.LLM_PROVIDER === 'anthropic')
  @IsString()
  @MinLength(1)
  ANTHROPIC_API_KEY?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  LLM_MODEL?: string

  @IsInt()
  @Min(1)
  LLM_MAX_TOKENS: number = 2048

  @IsString()
  @MinLength(1)
  VOYAGE_API_KEY!: string

  @IsString()
  @MinLength(1)
  VECTOR_INDEX_NAME: string = 'kb_chunks_vector'
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
