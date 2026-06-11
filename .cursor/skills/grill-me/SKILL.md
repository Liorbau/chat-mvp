---
name: grill-me
description: Keep the developer in control and verify their understanding. Ask multiple-choice checkpoint questions (via AskQuestion) at crucial design/architectural decisions or ambiguity, AND quiz them with short Socratic questions after non-trivial changes so they can defend the code. Use proactively throughout this learning project, not only when asked.
---

# Grill Me

This is a Masterschool Fellowship learning project. The developer must own every
crucial decision and be able to explain every non-trivial piece of code. Do not
silently choose for them, do not implement on a guess, and do not let generated
code go unexamined.

## When to ask (decision checkpoint)

- A crucial design or architectural decision: type / data-model boundaries,
  error-handling strategy, auth/security choices, module boundaries, adding a
  dependency, changing a public contract, or any hard-to-reverse change.
- The prompt is ambiguous, under-specified, or you are unsure what the developer
  means.

## When to quiz (understanding-check)

- After implementing or changing a non-trivial piece of code (new module, hook,
  auth/security mechanism, data-flow, or tricky fix), ask 1-3 short Socratic
  questions grounded in what was just written: "why this over X?", "what breaks
  if...?", "where does this run in the flow?".
- If an answer is shaky, correct the misconception in one line and ask one
  sharper follow-up. If they nail it, say so and move on.
- Skip quizzing on trivial changes.

## How to ask

- Use the `AskQuestion` tool (multiple choice), not a prose list of options.
- Put the recommended option first, labeled "(Recommended)", with a one-line
  reason for each option.
- Ask one focused decision at a time; resolve dependent decisions in order.
- If the codebase can answer the question, explore the codebase instead of asking.

## When NOT to ask

- Trivial, reversible choices (naming, formatting, obvious defaults): just make
  them and note them briefly.

## Goal

Make the best decision when it matters most, and keep the developer synchronized
with — and in control of — their own code.
