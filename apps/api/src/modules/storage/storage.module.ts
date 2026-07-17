import { Module } from '@nestjs/common'
import { OBJECT_STORAGE } from './object-storage'
import { S3ObjectStorage } from './s3.storage'

// To swap providers, implement ObjectStorage in a new class and change `useClass`
// here — nothing else in the app changes.
@Module({
  providers: [{ provide: OBJECT_STORAGE, useClass: S3ObjectStorage }],
  exports: [OBJECT_STORAGE],
})
export class StorageModule {}
