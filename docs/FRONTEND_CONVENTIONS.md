# Frontend Structure Conventions

Canonical rulebook for how the `apps/web` frontend is organized. New UI work —
by developers or agents — must follow this.

Related: [`ARCHITECTURE.md`](../ARCHITECTURE.md) (system architecture),
[`CLAUDE.md`](../CLAUDE.md) (engineering principles).

---

## 0. Scope of these conventions

These rules govern **directory/file structure** (where code lives and how it's
split into files) — for scalability and readability. They are **not** a license
to rewrite working components or logic. Specifically:

- Keep our existing component markup and behavior — just relocate them into the
  structure below and co-locate their constants/types. Styling uses **Tailwind
  CSS v4** utility classes, held as class-name string constants in
  `X.constants.ts` (faithful arbitrary values, e.g. `bg-[#2563eb]`, where our
  palette needs them).
- Apply the presentational/container split and context where it removes real
  prop-drilling — but **do not over-decompose** (e.g. no one-file-per-input
  components) beyond what readability needs. Match the spirit, keep it ours.

## 1. Top-level layout (`apps/web/src`)

```
src/
  api/                 # the ONLY network layer: fetch core + per-domain actions
    apiClient.ts       # request() core, auth header, error mapping, SSE reader
    types.ts           # ApiRequestError + shared request/response helper types
    auth.api.ts        # login, signup
    users.api.ts       # getUsers
    conversations.api.ts
    messages.api.ts
    ai.api.ts          # streamAssistant (SSE)
    knowledge.api.ts
    profile.api.ts     # updateProfile
  shared/              # cross-feature building blocks
    constants/
    hooks/
  features/            # one folder per UI domain (see the feature map below)
    app/               # the shell: layout, mode switching, toasts, navigation
    auth/
    user/
    conversations/
    messages/
    ai/                # assistant + tutor panels + streaming hook
    knowledge/         # knowledge-base document management
    profile/
  App.tsx  main.tsx  index.css
```

## 2. Feature-slice anatomy

Each `features/<domain>/` owns everything for that domain and is organized by
*kind*:

```
features/<domain>/
  components/          # this domain's components (each is a folder — see §3)
  hooks/              # data + behavior hooks, split by action (see §6)
  context/            # <Domain>Provider.tsx + <domain>.context.ts (see §5)
  constants/          # domain-wide constants (component-specific ones co-locate)
  types/              # domain-wide types (component-specific ones co-locate)
  utils/              # pure helpers (functions that take values, return values)
```

Only add the subfolders a domain actually needs. A domain never imports another
domain's *internals* — cross-domain sharing goes through `shared/`, `api/`, or a
context that the owning feature exports.

## 3. A component is a folder

Any non-trivial component is its own folder named after it (PascalCase):

```
components/MessageComposer/
  MessageComposer.tsx            # presentational: JSX, DOM, events (see §4)
  MessageComposerContainer.tsx   # container: state + wiring (see §4)
  MessageComposer.constants.ts   # styles / magic values for this component
  MessageComposer.types.ts       # props + local types
  MessageComposer.test.tsx       # co-located test
  ComposerButton.tsx             # simple sub-components: FLAT in the folder
  ComposerTextarea.tsx
  hooks/                         # hooks used only by this component
  utils/                         # pure helpers used only by this component
```

Rules:
- **When a component grows a nested sub-part, extract that sub-part into its own
  file.** Don't nest large JSX blocks or helper functions inline.
- **Simple/leaf sub-components go FLAT** directly inside the component's folder
  (as above) — do **not** create a nested `components/` folder for them (avoid the
  confusing `components/X/components/` nesting).
- Only give a sub-component its *own folder* (with its own `.constants`/`.types`/
  sub-parts) when it is itself complex enough to need one.

## 4. Presentational vs. container (separate rendering from logic)

- **`X.tsx` (presentational)** — owns the *browser*: JSX, HTML elements, event
  handlers wired to callbacks. It receives data + callbacks via props/context and
  renders. It does **not** fetch, hold business state, or make decisions.
- **`XContainer.tsx` (container)** — owns the *logic*: reads hooks/context, calls
  API actions, holds state, and hands plain values + callbacks down to `X.tsx`.
- **`utils/` functions** — the code that *does something* is a pure function that
  **takes a value and returns a value** (e.g. `toProfileErrors(error)`), kept out
  of the JSX. Event handlers in the presentational file should call these, not
  inline the logic.

Mnemonic: *HTML/events live where the element is rendered; the function that does
work takes a value and lives in a container/hook/util.*

## 5. Context over prop-drilling

If a value or callback would be threaded through more than ~2 component layers,
put it in a **feature context** instead:

```
features/<domain>/context/
  <domain>.context.ts     # createContext + a typed use<Domain>() hook
  <Domain>Provider.tsx    # the provider that supplies the value
```

Examples in this app: the current authenticated user (`auth`), the user
directory + display-name resolver (`user`), the selected conversation
(`conversations`). Presentational components read context through the feature's
`use<Domain>()` hook — never receive these as deep props.

## 6. Hooks split by action; reducers for non-trivial state

- One hook per action/responsibility: `useFetchMessages`, `useSendMessage`,
  `useConversations`, `useUpdateProfile` — not one mega-hook.
- Non-trivial state uses a **pure reducer** (`reducer.ts`) with no React imports,
  unit-tested in isolation.
- Hooks call the **`api/` actions**; components call hooks. Components and
  presentational files never call `fetch` or the api layer directly.

## 7. The API layer (`src/api`)

- `apiClient.ts` is the single low-level seam (base URL, `Authorization` header,
  error → `ApiRequestError`, the SSE stream reader). Nothing else calls `fetch`.
- Each domain gets a `<domain>.api.ts` with small, named action functions that
  use the core `request()`; these are what feature hooks import.
- Keep transport concerns here only; never leak `Response`/`fetch` upward.

## 8. Co-location & naming

- Constants, types, and tests live **next to** the component/hook they belong to
  (`X.constants.ts`, `X.types.ts`, `X.test.tsx`); only truly shared ones go to a
  feature-level or `shared/` folder.
- Components/folders: `PascalCase`. Hooks: `useThing.ts`. Everything else:
  match the existing lowercase-dotted style (`x.context.ts`, `x.constants.ts`).
- **Imports:** use the `@/` alias for cross-folder imports (`@/features/...`,
  `@/shared/...`); keep `./` only for same-folder siblings.
- **Exports:** prefer named exports (`export function X`) over default exports.
- Order folders to mirror the UI (top-to-bottom / outer-to-inner) where a natural
  order exists.

## 9. Feature map (this app)

| Feature | Owns |
| --- | --- |
| `app` | shell/layout, mode switching (`ModeSwitcher`), back navigation, `ErrorToast` |
| `auth` | login/signup screens, session context, `authStorage` |
| `user` | user directory + display-name context (resolves names for message labels) |
| `conversations` | sidebar list, search, new-conversation flow, selection context |
| `messages` | thread panel, list, bubbles, composer, optimistic send |
| `ai` | assistant + tutor panels, SSE streaming hook + reducer |
| `knowledge` | knowledge-base document upload/list/delete |
| `profile` | profile page (edit name / email) |
