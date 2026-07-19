import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { PutObjectInput, StorageProvider } from './storage.provider'

// Works with any S3-compatible store. Set STORAGE_S3_ENDPOINT for a non-AWS store.
@Injectable()
export class S3Storage implements StorageProvider {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly publicBaseUrl: string

  constructor(configService: ConfigService) {
    const endpoint = configService.get<string>('STORAGE_S3_ENDPOINT')
    this.client = new S3Client({
      region: configService.getOrThrow<string>('STORAGE_S3_REGION'),
      ...(endpoint !== undefined ? { endpoint, forcePathStyle: true } : {}),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('STORAGE_S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>('STORAGE_S3_SECRET_ACCESS_KEY'),
      },
    })
    this.bucket = configService.getOrThrow<string>('STORAGE_S3_BUCKET')
    this.publicBaseUrl = configService.getOrThrow<string>('STORAGE_PUBLIC_BASE_URL')
  }

  async put(input: PutObjectInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        CacheControl: input.cacheControl,
      }),
    )
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }

  publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`
  }
}
