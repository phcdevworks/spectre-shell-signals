# CLAUDE.md - spectre-shell-signals

**Package:** `@phcdevworks/spectre-shell-signals`
**Human owner:** Bradley Potts
**Primary AI developer:** Claude Code (claude-sonnet-4-6)

This file is the authoritative guide for Claude Code operating in this
repository. Read it before touching any source file.

## Multi-Agent Team

`AGENTS.md` is the shared guide for agent roles, edit boundaries, and PR
requirements. Claude Code is the lead implementation authority for reactive
primitive authoring, source changes, and architecture. Resolve implementation
conflicts by referencing this file and `AGENTS.md`.

## Commit Policy

Claude Code does not create git commits in this repository. Prepare changes,
run all validation, and leave staging, committing, tagging, and pushing to
human review.

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`. Claude Code prepares validated
changes for human review; Bradley Potts handles final commit, merge, tag, and
release authority.

## Commands

```bash
npm install          # install deps
npm run typecheck    # TypeScript check, no emit
npm run lint         # ESLint
npm run build        # tsup -> dist/ (ESM + CJS + .d.ts)
npm run test         # vitest run (one-shot)
npm run check        # typecheck + lint + build + test + check:version-sync + check:ecosystem (the full gate)
npm run format       # prettier --write
npm run clean        # rm -rf dist
npm run release:propose  # propose semver bump from CHANGELOG.md [Unreleased]
```

`npm run check` is the authoritative pre-publish and pre-PR gate. Always run it
before declaring work done.

## Architecture

```text
src/
  index.ts              # public re-exports only
  signal.ts             # Signal<T> - mutable reactive value
  computed.ts           # Computed<T> - lazy derived value with disposal
  effect.ts             # effect() - reactive side-effect with cleanup
  batch.ts              # batch() - deferred subscriber notification
  internals/
    node.ts             # Node - subscriber registry per reactive source
    tracking.ts         # activeObserver stack, withTracking, clearTracking
tests/
  signals.test.ts       # full behavioral test suite (35 tests)
```

**Reactive model**: every `.value` read inside a tracked context (effect or
computed) registers the reader as a subscriber on that signal's `Node`. When a
signal is written, its `Node` fans out `notify()` to all subscribers. Computed
values propagate invalidation lazily; effects re-run immediately.

**Internals are private**: `Node` and `tracking.ts` are not exported. Do not
export them.

## Public API

```ts
signal<T>(initialValue: T): Signal<T>
computed<T>(fn: () => T): Computed<T>
effect(fn: EffectCallback, options?: EffectOptions): StopEffect
batch(fn: () => void): void
```

Exported types: `Signal`, `Computed`, `EffectCallback`, `EffectCleanup`,
`EffectOptions`, `CleanupRegistrar`, `StopEffect`.

Before adding any export, ask:

- Does this directly support primitive reactivity?
- Is this required now, not hypothetically later?
- Would this make the package feel more like a store or framework runtime?

If there is any doubt, do not add it.

## Non-goals (do not add)

Stores, selectors, atoms, resources, async signals, DOM helpers, framework hooks
(`useSignal`), persistence, event buses, observable streams, middleware, plugins,
devtools, transaction systems, scheduler complexity.

See `AGENTS.md` for the full boundary list.

## Tooling

| Tool                       | Config                                   |
| -------------------------- | ---------------------------------------- |
| TypeScript 6               | `tsconfig.json`                          |
| tsup                       | `tsup.config.ts`                         |
| ESLint + typescript-eslint | `eslint.config.ts`                       |
| Prettier                   | `.prettierrc`                            |
| Vitest                     | `vitest.config.ts`                       |
| CI                         | `.github/workflows/ci.yml` (Node 22, 24) |

`tsconfig.json` includes `"ignoreDeprecations": "6.0"` — required for TypeScript
6 compatibility with some legacy flags. Do not remove it.

## Development Rules

- Edit the smallest focused change that solves the problem.
- Never skip `npm run check` before claiming work is done.
- Tests are part of the contract — behavior changes require test updates.
- Do not add comments that explain what the code does; well-named identifiers
  handle that.
- Do not create new files unless strictly necessary.
- The `dist/` directory is generated — never edit it directly.

## Test Expectations

Reactive packages drift when semantics are changed casually. Changes that affect
behavior should add or update coverage for cases such as:

- signal read/write behavior
- unchanged writes not notifying dependents
- computed laziness and caching
- dependency invalidation
- effect initial execution
- cleanup before re-run and on disposal
- dependency switching
- nested computed values
- multiple subscribers
- circular/self-referential protection where applicable

Do not change semantics without tests that prove the intended behavior.

## Documentation Requirements

README and package metadata must stay aligned with the actual implementation.

- Keep the README narrow and package-oriented.
- Document only exports that actually exist.
- Reinforce non-goals to prevent drift.
- Avoid speculative roadmap language.
- Keep naming, repository URLs, badges, and package metadata consistent.

If the repository name, package name, and docs are misaligned, fix that as part
of repo hygiene.

## Change Sizing

Prefer small, controlled changes:

- one semantic fix
- one documentation alignment pass
- one validation or CI improvement
- one metadata consistency fix

Avoid large mixed changes that combine runtime redesign, docs rewrite, packaging
changes, test overhauls, and naming changes unless all are required to resolve one
clearly bounded issue.

## Drift Check Before Finalizing

Before submitting work, review the result against these questions:

- Is the package still reactive-primitives-only?
- Did any store-like concept leak in?
- Did any framework-specific concept leak in?
- Did the public API grow unnecessarily?
- Did docs promise anything not implemented?
- Did package metadata stay consistent with repo identity?

If any answer is yes, fix the drift before finishing.

## Release Hygiene

- Update `CHANGELOG.md` under `[Unreleased]` for any user-visible change.
- `package.json` version follows semver; bump it when publishing.
- Run `npm run release:propose` to get a semver bump proposal from
  `CHANGELOG.md [Unreleased]`. Bradley Potts has final version authority; the
  script is advisory.
- `npm run check` runs automatically as `prepublishOnly`.
- CI runs on every push/PR to `main` across Node 22 and 24.
