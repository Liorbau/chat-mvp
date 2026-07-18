import { Module } from '@nestjs/common'
import { STORAGE_PROVIDER } from './storage.provider'
import { S3Storage } from './s3.storage'

// To swap providers, implement StorageProvider in a new class and change
// `useClass` here — nothing else in the app changes.
@Module({
  providers: [{ provide: STORAGE_PROVIDER, useClass: S3Storage }],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
