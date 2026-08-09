# Spectre Shell Signals Roadmap

`@phcdevworks/spectre-shell-signals` is the minimal reactive-primitives package
for the Spectre shell system. It exposes `signal`, `computed`, `effect`,
`asyncEffect`, `batch`, and directly related types — and nothing else. The
scope is intentionally tiny and must stay that way.

This document tracks what's next. For what already shipped and why, see
[CHANGELOG.md](CHANGELOG.md) (release-by-release detail) and git history —
this file does not restate delivered work.

---

## Delivered Phases

| Phase | Summary | Shipped in |
| --- | --- | --- |
| 1 | Foundation — `signal`, `computed`, `effect`, private `Node`/tracking internals, dual ESM/CJS build, `npm run check` gate, CI on Node 22/24 | 1.0.0 |
| 2 | Mature operations — `signal.peek()`, `batch()`, `EffectOptions.onError`, computed stability audit, ecosystem manifest, 35-case test suite | 1.1.0 |
| 3 | Integration & adoption — `docs/integration/` for spectre-tokens/spectre-ui/spectre-ui-astro, integration guide, versioning policy, `check:ecosystem` | 1.2.0 |
| 4 P0 | `asyncEffect()` — cancelable async effect variant, sync-only dependency tracking, per-run `AbortSignal`. Triggered by a proven downstream need; see `docs/decisions/async-effect-support.md` | Unreleased |

---

## What's Next

No active phase is currently open. New work opens on demand, when a
downstream consumer surfaces a concrete need — see [TODO.md](TODO.md).

---

## Explicitly Out of Scope

- Stores, atoms, selectors, or app-wide state containers
- Framework adapters (React, Vue, Solid, Astro-specific hooks)
- Persistence, localStorage, or sessionStorage helpers
- A full async resource/query layer (loading/error/caching state, request
  deduplication) — `asyncEffect()` is a cancelable-effect primitive, not a
  data-fetching layer
- Event buses or observable streams
- Middleware, plugins, or scheduler complexity
- DOM binding helpers or rendering lifecycle
- `src/internals/` (`Node`, `tracking.ts`) is never exported, including as a
  DevTools facade, unless `docs/decisions/devtools-hook.md`'s criteria are met
