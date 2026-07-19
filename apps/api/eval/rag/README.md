# Tutor RAG eval

Drives the real API end-to-end and measures retrieval and answer quality.

## What it does

1. Signs up a fresh eval user.
2. Uploads the source documents in `docs/` (distinct topics).
3. Asks every question in `fixtures.json` through the tutor endpoint and reads the
   streamed answer + citations.
4. Scores three things:
   - **retrieval recall@4** — did the expected document appear in the answer's
     citations? (citations are the retrieved chunks)
   - **answer coverage** — does the answer contain the fixture's expected keywords?
   - **out-of-KB refusals** — for questions with no supporting document, did the
     tutor refuse (no citations) instead of hallucinating?

## Run

```
npm run dev:api        # the eval talks to the running API
npm run eval:rag -w @chat/api
```

It self-throttles to ~3 requests/min (Voyage's card-free cap), so a full run
takes several minutes. Override the target with `EVAL_API_BASE_URL`.

## Fixtures

`fixtures.json` is an array of:

```json
{
  "id": "photo-inputs",
  "question": "What are the inputs of photosynthesis?",
  "expectedDocument": "photosynthesis.md",
  "expectedKeywords": ["carbon dioxide", "water", "light"]
}
```

`expectedDocument: null` marks an out-of-KB question (the tutor should refuse).

## Sample run

14 questions (12 in-KB across 3 documents, 2 out-of-KB), temperature 0:

```json
{
  "questions": 14,
  "precisionAt4": 0.625,
  "recallAt4": 1.0,
  "hitRateAt4": 1.0,
  "answerScore": 1.0,
  "refusalAccuracy": 1.0,
  "overall": 1.0
}
```

**Interpretation.** Retrieval is reliable: every in-KB question retrieved its
expected document (recall@4 and hit-rate@4 = 1.0). precision@4 is 0.625 because
each source doc only has ~2 chunks, so the top-4 usually includes 2 relevant
chunks plus 2 from another doc — expected when k exceeds the per-doc chunk count,
and harmless since the LLM grounds only on what's relevant. Answers covered all
expected key facts (1.0), and both out-of-KB questions were correctly refused
("I don't have that in your notes") rather than hallucinated (1.0).

