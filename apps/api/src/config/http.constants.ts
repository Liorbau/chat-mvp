// Maximum accepted JSON request body size. Kept explicit (rather than relying on
// the framework default) and shared between the runtime bootstrap and the test
// app so both enforce — and can verify — the same 413 boundary.
export const JSON_BODY_LIMIT = '100kb'
