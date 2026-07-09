import { Embeddings } from '@langchain/core/embeddings'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

// Model + dimension are fixed by the Atlas index (no config).
const VOYAGE_MODEL = 'voyage-3.5-lite'
const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings'
const MAX_BATCH = 128 // Voyage caps inputs per request; large docs need splitting.

// Voyage returns one object per input, each carrying its input `index`.
type VoyageResponse = { data: { index: number; embedding: number[] }[] }

function batch<T>(items: T[], size: number): T[][] {
  const groups: T[][] = []
  for (let start = 0; start < items.length; start += size) {
    groups.push(items.slice(start, start + size))
  }
  return groups
}

@Injectable()
export class VoyageEmbeddings extends Embeddings {
  private readonly apiKey: string

  constructor(configService: ConfigService) {
    super({})
    this.apiKey = configService.getOrThrow<string>('VOYAGE_API_KEY')
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = []
    for (const group of batch(texts, MAX_BATCH)) {
      vectors.push(...(await this.embed(group, 'document')))
    }
    return vectors
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embed([text], 'query')
    if (vector === undefined) {
      throw new Error('Voyage returned no embedding for the query')
    }
    return vector
  }

  private async embed(input: string[], inputType: 'document' | 'query'): Promise<number[][]> {
    const res = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ input, model: VOYAGE_MODEL, input_type: inputType }),
    })
    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`Voyage embeddings failed (${res.status}): ${detail}`)
    }
    const json = (await res.json()) as VoyageResponse
    return json.data.sort((a, b) => a.index - b.index).map((item) => item.embedding)
  }
}
