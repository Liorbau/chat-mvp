// Request augmentation shared by all lanes.
// - userId/token are set by the authenticate middleware on protected routes.
// - validated holds parsed outputs by source ("body" | "params" | "query")
//   from the validate middleware (read them via getValidated<T>).

declare global {
  namespace Express {
    interface Request {
      userId?: string
      token?: string
      validated?: Partial<Record<'body' | 'params' | 'query', unknown>>
    }
  }
}

export {}
