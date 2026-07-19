export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER')

export type PutObjectInput = {
  key: string
  body: Buffer
  contentType: string
  cacheControl: string
}

// The swappable storage seam
export interface StorageProvider {
  put(input: PutObjectInput): Promise<void>
  delete(key: string): Promise<void>
  // Provider-specific public CDN URL for reading the object at `key`.
  publicUrl(key: string): string
}
