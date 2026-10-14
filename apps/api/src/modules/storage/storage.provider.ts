export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER')

export type PutObjectInput = {
  key: string
  body: Buffer
  contentType: string
  cacheControl: string
}

export interface StorageProvider {
  put(input: PutObjectInput): Promise<string>
  delete(key: string): Promise<string>
  // Provider-specific public CDN URL for reading the object at `key`.
  publicUrl(key: string): string
}
