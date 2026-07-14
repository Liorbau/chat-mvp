import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Deterministic in-memory localStorage so the suite runs identically on any
// machine/Node version (jsdom + newer Node don't reliably provide one).
const store = new Map<string, string>()
const memoryStorage: Storage = {
  get length() {
    return store.size
  },
  clear: () => store.clear(),
  getItem: (key) => store.get(key) ?? null,
  key: (index) => [...store.keys()][index] ?? null,
  removeItem: (key) => store.delete(key),
  setItem: (key, value) => store.set(key, String(value)),
}
globalThis.localStorage = memoryStorage

afterEach(() => {
  cleanup()
})

if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = function noopScrollIntoView() {
    // jsdom does not implement scrollIntoView; tests do not assert on it.
  }
}
