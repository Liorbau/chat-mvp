import { plainToInstance } from 'class-transformer'
import {
  IsEmail,
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
export type EmailProviderName = 'log' | 'ses'
export type ResetCodeDriver = 'redis' | 'memory'

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

  // Separate secret so a confirm token can never be replayed as a session JWT.
  @IsString()
  @MinLength(32)
  EMAIL_CHANGE_TOKEN_SECRET!: string

  @IsString()
  @MinLength(1)
  EMAIL_CHANGE_TOKEN_TTL: string = '30m'

  // Public web-app URL used to build the confirmation link in emails.
  @IsString()
  @Matches(/^https?:\/\//, { message: 'WEB_APP_URL must be an http(s) URL' })
  WEB_APP_URL: string = 'http://localhost:5173'

  // 'log' prints the confirmation link to the server console (dev); 'ses' sends via AWS SES.
  @IsIn(['log', 'ses'])
  EMAIL_PROVIDER: EmailProviderName = 'log'

  @ValidateIf((env: EnvironmentVariables) => env.EMAIL_PROVIDER === 'ses')
  @IsString()
  @MinLength(1)
  EMAIL_SES_REGION?: string

  @ValidateIf((env: EnvironmentVariables) => env.EMAIL_PROVIDER === 'ses')
  @IsEmail()
  EMAIL_FROM?: string

  @IsIn(['redis', 'memory'])
  RESET_CODE_DRIVER: ResetCodeDriver = 'redis'

  @ValidateIf((env: EnvironmentVariables) => env.RESET_CODE_DRIVER === 'redis')
  @IsString()
  @MinLength(1)
  REDIS_URL?: string
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
