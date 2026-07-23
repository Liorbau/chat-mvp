# Frontend Structure Conventions

Canonical rulebook for how the `apps/web` frontend is organized. New UI work —
by developers or agents — must follow this.

Related: [`ARCHITECTURE.md`](./ARCHITECTURE.md) (system architecture),
[`CLAUDE.md`](../CLAUDE.md) (engineering principles).

> **Reference implementation:** the **avatar feature** is the worked example of
> every rule below — the edit UI at
> `features/profile/components/ProfilePanel/components/AvatarSection/` and the
> reusable display atom at `features/user/components/UserAvatar/`. When a rule is
> ambiguous, copy those. See §9 for the migration status of older code.

---

## 0. Scope of these conventions

These rules govern **directory/file structure** (where code lives and how it's
split into files) — for scalability and readability. Specifically:

- Keep component markup and behavior; relocate it into the structure below and
  co-locate its files. Styling uses **Tailwind CSS v4** utility classes, held as
  class-name string constants in **`X.styles.ts`** (faithful arbitrary values,
  e.g. `bg-[#2563eb]`, where our palette needs them) — **never** mixed into
  `X.constants.ts` (see §3, §8).
- Apply the presentational/container split and context to remove prop-drilling.
- **Decompose by concern.** A distinct concern, a condition, a stateful control,
  a sub-view, or an SVG icon each becomes its own component (§3, §4). But prefer
  **one reusable, parameterized leaf** over many near-identical ones — decompose
  distinct concerns, don't clone the same leaf.

## 1. Top-level layout (`apps/web/src`)

```
src/
  api/                 # shared network infra + multi-feature ("commonly used") actions
    apiClient.ts       # request() core: base URL, auth header, error mapping
    sse.ts             # readSseStream(): reusable SSE frame reader
    types.ts           # ApiRequestError + shared request/response helper types
    conversations.api.ts  messages.api.ts  profile.api.ts  email-change.api.ts
                       # single-feature actions live in that feature's apiActions/ (§7)
  shared/              # cross-feature building blocks
    constants/
    hooks/             # generic reusable hooks (e.g. useFileDropzone, useImageFallback)
  features/            # one folder per UI domain (see the feature map in §10)
    app/ auth/ user/ conversations/ messages/ ai/ knowledge/ profile/
  App.tsx  main.tsx  index.css
```

## 2. Feature-slice anatomy

Each `features/<domain>/` owns everything for that domain, organized by *kind*:

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
context the owning feature exports. Organize by **domain/screen, not by widget**:
a reusable display atom lives in its domain (`UserAvatar` in `user`); an edit UI
lives in the feature that owns the screen (`AvatarSection` under `profile`).
There is no `features/<widget>` slice.

## 3. A component is a folder, and the folder tree mirrors the UI tree

Any non-trivial component is its own folder (PascalCase). Its children live in a
**nested `components/` folder**, and each child is itself a component-folder, so
the directory tree reflects the on-screen hierarchy — **the tree is not flat**:

```
components/AvatarSection/
  AvatarSectionContainer.tsx     # container: hook + provider (see §4)
  AvatarSection.tsx              # presentational: composes children, no logic
  AvatarSection.context.ts       # one context for this tree (see §5)
  AvatarSection.types.ts         # context-value / prop types (derived — see §5)
  AvatarSection.styles.ts        # class-name strings + class builders (styles only)
  AvatarSection.constants.ts     # values / labels / messages (no styles)
  AvatarSection.utils.ts         # pure logic (label selectors, derivations)
  AvatarSection.test.tsx         # co-located test
  hooks/useAvatar.ts             # state for this tree
  components/                    # children — each its own folder, mirrors the UI
    Dropzone/
      Dropzone.tsx  Dropzone.styles.ts  Dropzone.types.ts
      components/
        AvatarPreview/AvatarPreview.tsx
        DropzoneHint/DropzoneHint.tsx  DropzoneHint.styles.ts  DropzoneHint.utils.ts  DropzoneHint.constants.ts
    AvatarActions/
      AvatarActions.tsx  AvatarActions.styles.ts
      components/
        UploadButton/  RemoveButton/  AvatarError/  PreviewWarning/
    FileInput/
      FileInput.tsx  FileInput.styles.ts  FileInput.constants.ts
```

Rules:
- **Each on-screen part is its own named component in its own folder.** If a
  component renders a distinct sub-part (a control, a message, a sub-view, an
  icon), that sub-part is extracted — never nest large JSX blocks or helper
  functions inline.
- **Nest `components/` to match the UI.** A child that visually lives inside a
  parent lives inside the parent's `components/` folder (`Dropzone/components/
  DropzoneHint/`). Depth in the folder tree = depth in the UI.
- **Split files by role, one role per file** (see §8): `.tsx` (component),
  `.types.ts` (types), `.styles.ts` (class strings/builders), `.constants.ts`
  (values), `.utils.ts` (pure logic), `hooks/` (state), `.context.ts` (context).
  Create only the files a component needs.
- **Soft cap of ~one responsibility per file.** A `.tsx` is either a *view*
  (markup/composition) or a *container* (hook wiring) — never both.

## 4. Container vs. presentational; state, abstraction, and conditions

- **`X.tsx` (presentational)** — owns the *browser*: JSX, elements, and events
  wired to callbacks. It reads data/callbacks from **context** (or props, for a
  reusable atom) and renders. It holds **no state**, fetches nothing, makes no
  business decisions.
- **`XContainer.tsx` (container)** — the file that holds the **hook/state**. It
  stays thin: call the hook, provide its value via context, render the view
  (`const value = useX(); return <XContext.Provider value={value}><X /></…>`).
  A container may also pass a hook's view-model to a presentational child as
  props when there's no deeper tree (e.g. `UserAvatarContainer → UserAvatar`).
- **State defines the container, not the `if`.** A component is *non*-
  presentational because it holds state (a hook) — **not** because it contains a
  condition. So the fix for "a presentational component holds state" is to move
  the hook into an `XContainer`, leaving the view stateless.
- **Single level of abstraction.** A view composes **named children only**.
  Derivations/label choices go to `.utils.ts`; class assembly goes to
  `.styles.ts`; state goes to a hook. A component that mixes composition with an
  inline ad-hoc block is a smell — extract the block.
- **No conditions inside JSX markup, and exactly one `return` per component.**
  `{cond ? <A/> : <B/>}` / `{cond && <A/>}` nested inside a parent's markup are
  banned — and so are multiple `return` statements (no early-return guards). Give the
  condition its own **self-standing component** whose single job is the choice, and
  express it with **one** return:
  1. **A single-return ternary** for a two-way choice — `return error == null ? null
     : <p>{error}</p>` (`AvatarError`), `return hasAvatar ? <button…/> : null`
     (`RemoveButton`), `return imageUrl == null ? <AvatarFallback/> : <AvatarImage/>`
     (`UserAvatar`).
  2. **Assign-then-return** for 3+ branches — compute the element into one variable
     via `if`/`else if`/`switch`, then `return element` once (`App`,
     `PasswordResetFlow`).

  The parent just renders `<AvatarError />` with no `{error && …}` around it.
- **Layout components render structure + `children` only.** A shell like `AuthCard`
  (the auth screen/card wrapper) takes no title/content props — callers compose the
  pieces (`<AuthCardHeader title subtitle />`, the form, footer buttons) as
  `children`. This keeps the shell reusable and free of screen-specific knowledge.

Mnemonic: *state lives in a hook (container); markup/events live in the view;
the value-in/value-out function lives in `.utils.ts`; the class string lives in
`.styles.ts`.*

## 5. One context per component-tree; over prop-drilling

A value/callback threaded through more than ~2 layers goes in a **context** —
either a feature context or a per-component-tree context.

```
AvatarSection.context.ts   # createContext + a typed useAvatarContext() reader
```

- **One context per tree, not per leaf.** The container provides a single context
  at the tree root; every descendant reads it via the tree's `useXContext()`
  hook. Leaves inside a context tree carry **~zero props** — they read what they
  need. (A reusable cross-feature atom like `UserAvatar` is the exception: it
  takes props.)
- **The reader throws outside its provider:** `useXContext()` reads the context
  and throws a clear error if it's `null`.
- **Type the context value from its source of truth.** Derive it —
  `type XContextValue = ReturnType<typeof useX>` (and merge derived shapes with
  `& ReturnType<typeof useHook>` when composing) — never hand-write two shapes
  that can drift.
- **No prop pass-through.** If a component only forwards props to a child,
  extract a child that reads context directly (e.g. `AvatarPreview` reads
  `name`/`avatarUrl`/`onPreviewError` from context) instead of threading them.
- **Screen/form state is per-screen context too** (`useLoginForm` +
  `LoginFormContext`, `useProfileForm`, `useComposer`).

## 6. Hooks split by action; reducers for non-trivial state

- One hook per action/responsibility (`useFetchMessages`, `useSendMessage`,
  `useUpdateProfile`) — not one mega-hook.
- Non-trivial state uses a **pure reducer** (`reducer.ts`, no React imports),
  unit-tested in isolation.
- Hooks call the **api actions** (shared `api/` or the feature's `apiActions/`, §7);
  components call hooks. Presentational files never call `fetch` or the api layer.
- **Duplicated behavior → one shared hook.** Extract to `shared/hooks/` when
  reused across features (e.g. `useFileDropzone`, `useImageFallback`, both born
  from the avatar work and reused by `knowledge`); use a per-feature hook when
  scoped to one domain (`useComposer`).
- **Keep event/parse mapping pure and separate** from hook wiring
  (`handleAssistantEvent(dispatch, event)`), so the mapping is unit-testable.

## 7. The API layer (shared `src/api` + feature `apiActions/`)

- `apiClient.ts` is the single low-level seam (base URL, `Authorization` header,
  error → `ApiRequestError`). Nothing else calls `fetch` for authed JSON.
- Reusable transport helpers live beside it (`sse.ts` → `readSseStream`).
- **Co-locate actions with their consumer.** A `<domain>.api.ts` of small named
  actions (using `request()`) lives in a feature-local **`apiActions/`** folder next
  to the code that calls it — beside the single component/hook that consumes it, or
  at the feature root when 2+ of the feature's hooks share it.
- **Keep in shared `api/` only the commonly-used actions:** the infra (`apiClient`,
  `sse`, `types`, `ApiRequestError`) plus any `<domain>.api.ts` whose exports serve
  **more than one feature** (e.g. `conversations`/`messages` are used by their own
  feature *and* `ai`; `profile`/`email-change` span `auth`/`profile`/`email-change`).
  `api/index.ts` re-exports only these.
- Feature hooks import their `apiActions/`; presentational files never touch the api.
- Keep transport concerns here only; never leak `Response`/`fetch` upward.

## 8. Co-location, file roles & naming

- Files live **next to** the component they belong to; only truly shared ones go
  to a feature-level or `shared/` folder.
- **Split by role — this is strict:**
  - `X.styles.ts` → class-name strings **and** class-builder functions
    (`dropzoneClass(isDragging)`). Styles never live in `.constants.ts`.
  - `X.constants.ts` → fixed **values**: labels, messages, config
    (`REMOVE_BUTTON_LABEL`, `AVATAR_PREVIEW_ERROR_MESSAGE`).
  - `X.utils.ts` → pure **logic** functions that take input and return a value
    (`uploadButtonLabel(hasAvatar)`, `initialsFromName(name)`).
  - `X.types.ts` → prop/context types — **never inline** in the signature, even
    for tiny leaves.
  - A function that only assembles a `className` is styles; a function that picks
    *content* is utils.
- Components/folders: `PascalCase`. Hooks: `useThing.ts`. Everything else:
  lowercase-dotted (`x.context.ts`, `x.styles.ts`, `x.constants.ts`, `x.utils.ts`).
- **Imports:** `@/` alias across folders; `./` only for same-folder siblings.
- **Exports:** named exports (`export function X`), never default.
- **Container naming:** the file with the hook wears the `Container` suffix; the
  presentational file keeps the base name. Consumers render the `Container`.
- Order folders to mirror the UI (outer-to-inner) where a natural order exists.

## 9. Testing

- Test the **container entry** (the public component); name the test after it
  (`UserAvatarContainer.test.tsx`).
- Test a presentational tree by rendering it inside a **mocked context provider**
  with a crafted value (see `AvatarSection.test.tsx`) — no need to mock the api
  or auth. Assert the conditional rendering (guards), labels, and callbacks.

## 10. Migration status (legacy vs. current)

This rulebook was revised to the patterns proven on the avatar branch, then updated
(mentor review) so that **every component has one `return`** (guard-clause
early-returns were converted to single-return ternaries) and single-feature api calls
moved to feature-local `apiActions/` (§7). Some older code predates these revisions
and still follows previous rules (flat sub-components, `{cond && …}` in JSX, class
strings in `.constants.ts`). That code is **migration debt**, not a counter-example:

- **Current (follow these):** `features/user/components/UserAvatar/**`,
  `features/profile/components/ProfilePanel/components/AvatarSection/**`,
  `features/profile/components/ProfilePanel/components/PlanSection/**`.
- **Legacy (migrate opportunistically):** other components — e.g.
  `messages/**` (`MessageItem`, `MessageComposer`), `conversations/**`,
  `ai/**`, `auth/**`, and `profile/components/ProfilePanel`'s own `NameForm`/
  `EmailForm` (still flat files). When you next touch one of these, bring it up
  to the rules above.

## 11. Feature map (this app)

| Feature | Owns |
| --- | --- |
| `app` | shell/layout, mode switching, back navigation, `ErrorToast` |
| `auth` | login/signup screens, session context, `authStorage` |
| `user` | user directory + display-name context; `UserAvatar` display atom |
| `conversations` | sidebar list, search, new-conversation flow, selection context |
| `messages` | thread panel, list, bubbles, composer, optimistic send |
| `ai` | assistant + tutor panels, SSE streaming hook + reducer |
| `knowledge` | knowledge-base document upload/list/delete |
| `profile` | profile page (name / email / avatar / plan sections) |
