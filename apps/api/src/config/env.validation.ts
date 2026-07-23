import { plainToInstance } from 'class-transformer'
import { IsEmail, IsIn, IsInt, IsOptional, Min, ValidateIf, validateSync } from 'class-validator'
import { HttpUrl, OptionalString, RequiredString, RequiredWhen } from './env.decorators'

export type LlmProviderName = 'openai' | 'anthropic'
export type EmailProviderName = 'log' | 'ses'
export type ResetCodeDriver = 'redis' | 'memory'
export type QueueDriver = 'bullmq' | 'memory'
export type PaymentProviderName = 'local' | 'rapyd'

export class EnvironmentVariables {
  @RequiredString(32)
  JWT_SECRET!: string

  @IsInt()
  @Min(4)
  BCRYPT_ROUNDS!: number

  @RequiredString()
  JWT_EXPIRES_IN: string = '1h'

  @IsInt()
  @Min(1)
  PORT: number = 4000

  @RequiredString()
  CORS_ORIGIN: string = 'http://localhost:5173'

  @RequiredString()
  MONGO_URI!: string

  @IsIn(['openai', 'anthropic'])
  LLM_PROVIDER: LlmProviderName = 'openai'

  @RequiredWhen((env: EnvironmentVariables) => env.LLM_PROVIDER === 'openai')
  OPENAI_API_KEY?: string

  @RequiredWhen((env: EnvironmentVariables) => env.LLM_PROVIDER === 'anthropic')
  ANTHROPIC_API_KEY?: string

  @OptionalString()
  LLM_MODEL?: string

  @IsInt()
  @Min(1)
  LLM_MAX_TOKENS: number = 2048

  @RequiredString()
  VOYAGE_API_KEY!: string

  @RequiredString()
  VECTOR_INDEX_NAME: string = 'kb_chunks_vector'

  // --- Avatar object storage (S3-compatible; set STORAGE_S3_ENDPOINT for non-AWS) ---
  @HttpUrl()
  STORAGE_PUBLIC_BASE_URL!: string

  @RequiredString()
  STORAGE_S3_REGION!: string

  @RequiredString()
  STORAGE_S3_ACCESS_KEY_ID!: string

  @RequiredString()
  STORAGE_S3_SECRET_ACCESS_KEY!: string

  @RequiredString()
  STORAGE_S3_BUCKET!: string

  // Set for a non-AWS S3-compatible store (e.g. Cloudflare R2, Supabase); unset for AWS.
  @IsOptional()
  @HttpUrl()
  STORAGE_S3_ENDPOINT?: string

  // Separate secret so a confirm token can never be replayed as a session JWT.
  @RequiredString(32)
  EMAIL_CHANGE_TOKEN_SECRET!: string

  @RequiredString()
  EMAIL_CHANGE_TOKEN_TTL: string = '30m'

  // Public web-app URL used to build the confirmation link in emails.
  @HttpUrl()
  WEB_APP_URL: string = 'http://localhost:5173'

  // 'log' prints the confirmation link to the server console (dev); 'ses' sends via AWS SES.
  @IsIn(['log', 'ses'])
  EMAIL_PROVIDER: EmailProviderName = 'log'

  @RequiredWhen((env: EnvironmentVariables) => env.EMAIL_PROVIDER === 'ses')
  EMAIL_SES_REGION?: string

  @ValidateIf((env: EnvironmentVariables) => env.EMAIL_PROVIDER === 'ses')
  @IsEmail()
  EMAIL_FROM?: string

  @IsIn(['redis', 'memory'])
  RESET_CODE_DRIVER: ResetCodeDriver = 'redis'

  @RequiredWhen(
    (env: EnvironmentVariables) =>
      env.RESET_CODE_DRIVER === 'redis' || env.QUEUE_DRIVER === 'bullmq',
  )
  REDIS_URL?: string

  @IsIn(['bullmq', 'memory'])
  QUEUE_DRIVER: QueueDriver = 'bullmq'

  @IsIn(['local', 'rapyd'])
  PAYMENT_PROVIDER: PaymentProviderName = 'local'

  @HttpUrl()
  RAPYD_BASE_URL: string = 'https://sandboxapi.rapyd.net'

  @RequiredWhen((env: EnvironmentVariables) => env.PAYMENT_PROVIDER === 'rapyd')
  RAPYD_ACCESS_KEY?: string

  @RequiredWhen((env: EnvironmentVariables) => env.PAYMENT_PROVIDER === 'rapyd')
  RAPYD_SECRET_KEY?: string

  @RequiredWhen((env: EnvironmentVariables) => env.PAYMENT_PROVIDER === 'rapyd')
  RAPYD_CHECKOUT_COUNTRY?: string

  @RequiredWhen((env: EnvironmentVariables) => env.PAYMENT_PROVIDER === 'rapyd')
  RAPYD_WEBHOOK_URL?: string
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
