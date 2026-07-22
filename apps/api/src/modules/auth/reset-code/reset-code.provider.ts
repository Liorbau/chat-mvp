export const RESET_CODE_PROVIDER = Symbol('RESET_CODE_PROVIDER')

export interface ResetCodeProvider {
  store(userId: string, codeHash: string): Promise<string>
  find(userId: string): Promise<string | undefined>
  consume(userId: string): Promise<boolean>
}
