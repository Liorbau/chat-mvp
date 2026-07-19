import { plainToInstance } from 'class-transformer'
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
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

  // --- Avatar object storage (S3-compatible; set STORAGE_S3_ENDPOINT for non-AWS) ---
  @IsString()
  @Matches(/^https?:\/\//, { message: 'STORAGE_PUBLIC_BASE_URL must be an http(s) URL' })
  STORAGE_PUBLIC_BASE_URL!: string

  @IsString()
  @MinLength(1)
  STORAGE_S3_REGION!: string

  @IsString()
  @MinLength(1)
  STORAGE_S3_ACCESS_KEY_ID!: string

  @IsString()
  @MinLength(1)
  STORAGE_S3_SECRET_ACCESS_KEY!: string

  @IsString()
  @MinLength(1)
  STORAGE_S3_BUCKET!: string

  // Set for a non-AWS S3-compatible store (e.g. Cloudflare R2, Supabase); unset for AWS.
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\//, { message: 'STORAGE_S3_ENDPOINT must be an http(s) URL' })
  STORAGE_S3_ENDPOINT?: string
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
