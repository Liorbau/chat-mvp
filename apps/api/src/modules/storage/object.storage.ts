export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE')

export type PutObjectInput = {
  key: string
  body: Buffer
  contentType: string
  cacheControl: string
}

export interface ObjectStorage {
  put(input: PutObjectInput): Promise<void>
  delete(key: string): Promise<void>
}
