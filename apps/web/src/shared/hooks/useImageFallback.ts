import { useState } from 'react'

type ImageFallback = {
  failed: boolean
  onError: () => void
}

// Tracks the failed image URL, so a different URL (e.g. a new upload) auto-retries.
export function useImageFallback(url: string | null): ImageFallback {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  return {
    failed: url !== null && url === failedUrl,
    onError: () => setFailedUrl(url),
  }
}
