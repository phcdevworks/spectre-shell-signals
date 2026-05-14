# CLAUDE.md — spectre-shell-signals

Primary AI maintainer: **Claude Code** (claude-sonnet-4-6, Anthropic)
Human owner: PHCDevworks / brad.potts@coastdigitalgroup.com

## Commit Policy

Claude Code does **not** create git commits, push branches, or create tags in this repository. Changes are prepared and validated but left for human review and commit.

---

## What this package is

`@phcdevworks/spectre-shell-signals` is the reactive-primitives-only package for the Spectre shell system. It exposes three primitives — `signal`, `computed`, `effect` — and nothing else.

There is no store. There is no framework. There is no async layer. The scope is intentionally tiny and must stay that way.

---

## Commands

```bash
npm install          # install deps
npm run typecheck    # TypeScript check, no emit
npm run lint         # ESLint
npm run build        # tsup → dist/ (ESM + CJS + .d.ts)
npm run test         # vitest run (one-shot)
npm run check        # typecheck + lint + build + test (the full gate)
npm run format       # prettier --write
npm run clean        # rm -rf dist
```

`npm run check` is the authoritative pre-publish and pre-PR gate. Always run it before declaring work done.

---

## Architecture

```
src/
  index.ts              # public re-exports only
  signal.ts             # Signal<T> — mutable reactive value
  computed.ts           # Computed<T> — lazy derived value with disposal
  effect.ts             # effect() — reactive side-effect with cleanup
  internals/
    node.ts             # Node — subscriber registry per reactive source
    tracking.ts         # activeObserver stack, withTracking, clearTracking
tests/
  signals.test.ts       # full behavioral test suite (19 tests)
```

**Reactive model**: every `.value` read inside a tracked context (effect or computed) registers the reader as a subscriber on that signal's `Node`. When a signal is written, its `Node` fans out `notify()` to all subscribers. Computed values propagate invalidation lazily; effects re-run immediately.

**Internals are private**: `Node` and `tracking.ts` are not exported. Do not export them.

---

## Public API

```ts
signal<T>(initialValue: T): Signal<T>
computed<T>(fn: () => T): Computed<T>
effect(fn: EffectCallback): StopEffect
```

Exported types: `Signal`, `Computed`, `EffectCallback`, `EffectCleanup`, `CleanupRegistrar`, `StopEffect`.

Do not add exports without a clear reactive-primitives justification.

---

## Non-goals (do not add)

Stores, selectors, atoms, resources, async signals, DOM helpers, framework hooks (`useSignal`), persistence, event buses, observable streams, middleware, plugins, devtools, transaction systems, scheduler complexity.

See [AGENTS.md](./AGENTS.md) for the full boundary list.

---

## Tooling

| Tool | Config |
|---|---|
| TypeScript 6 | `tsconfig.json` |
| tsup | `tsup.config.ts` |
| ESLint + typescript-eslint | `eslint.config.ts` |
| Prettier | `.prettierrc` |
| Vitest | `vitest.config.ts` |
| CI | `.github/workflows/ci.yml` (Node 22, 24) |

`tsconfig.json` includes `"ignoreDeprecations": "6.0"` — required for TypeScript 6 compatibility with some legacy flags. Do not remove it.

---

## Development rules

- Edit the smallest focused change that solves the problem.
- Never skip `npm run check` before claiming work is done.
- Tests are part of the contract — behavior changes require test updates.
- Do not add comments that explain what the code does; well-named identifiers handle that.
- Do not create new files unless strictly necessary.
- The `dist/` directory is generated — never edit it directly.

---

## Release hygiene

- Update `CHANGELOG.md` under `[Unreleased]` for any user-visible change.
- `package.json` version follows semver; bump it when publishing.
- `npm run check` runs automatically as `prepublishOnly`.
- CI runs on every push/PR to `main` across Node 22 and 24.
