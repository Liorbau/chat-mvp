// Reads a Server-Sent Events response body, parsing each `data:` frame as JSON
// and handing it to onEvent. Transport-only; the streaming api actions use it.
export async function readSseStream<T>(
  response: Response,
  onEvent: (event: T) => void,
): Promise<void> {
  if (response.body === null) {
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary).trim()
      buffer = buffer.slice(boundary + 2)
      if (frame.startsWith('data:')) {
        const json = frame.slice(5).trim()
        if (json.length > 0) {
          onEvent(JSON.parse(json) as T)
        }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
}
