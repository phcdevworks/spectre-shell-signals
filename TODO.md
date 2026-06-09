# Spectre Shell Signals Execution Todo

Scoped to reactive correctness, ergonomics, and integration. Aligned to `ROADMAP.md`.

## Phase 1 — Foundation: Completed

All Phase 1 items were delivered during the v1.0.0 release cycle.

### P0: Reactive Primitive Implementation

- [x] Implement `signal<T>` with tracked reads and guarded writes
- [x] Implement `computed<T>` with lazy derivation, caching, and disposal
- [x] Implement `effect()` with dependency tracking, cleanup, and stop function
- [x] Implement `Node` subscriber registry and `tracking.ts` activeObserver stack
- [x] Keep internals (`Node`, `tracking.ts`) private and unexported

### P1: Build, Types, and Distribution

- [x] Export public types: `Signal`, `Computed`, `EffectCallback`, `EffectCleanup`,
      `CleanupRegistrar`, `StopEffect`
- [x] Dual ESM/CJS output via `tsup`
- [x] TypeScript 6 with strict mode via `tsconfig.json`
- [x] `npm run check` gate: typecheck + lint + build + test

### P2: Test Coverage and CI

- [x] Behavioral test suite covering: unchanged-write guards, computed caching,
      dependency switching, circular protection, cleanup on disposal
- [x] CI on Node 22 and 24 via `.github/workflows/ci.yml`

### P3: Documentation and Repo Hygiene

- [x] README aligned to public API with usage examples and package boundaries
- [x] CHANGELOG.md, CONTRIBUTING.md, ROADMAP.md, and AI agent coordination docs

---

## Phase 2 — Mature Operations: Completed

All Phase 2 items are delivered and validated as of v1.1.0.

### P0: Reactive Correctness

- [x] `signal.peek()` — untracked read, no dependency registration
- [x] Effect error boundary — `EffectOptions.onError`, effect stays active after error
- [x] Export `EffectOptions` type

### P1: Reactive Ergonomics

- [x] `batch()` — deferred notification for diamond graphs and multi-write scenarios
- [x] Computed stability audit — no-op writes confirmed not to invalidate dependents

### P2: Ecosystem and Validation

- [x] `spectre.manifest.json` — ecosystem role, layer, exports, and allowed targets
- [x] `check:ecosystem` wired into `npm run check` full gate
- [x] 35-case behavioral test suite covering all Phase 1 and Phase 2 semantics

### P3: Evaluation Documents

- [x] Async effect support decision document
- [x] DevTools hook decision document

---

## Phase 3 — Integration & Adoption: Completed

All Phase 3 items delivered. Integration docs live in `docs/integration/`.
Versioning policy documented. Ready to release as v1.2.0.

### P0: Publish Confirmation

- [x] Publish `@phcdevworks/spectre-shell-signals@1.1.0` to npm
- [x] Confirm published package is consumable from Node and browser
      (ESM + CJS, types resolve, `import` and `require` both work)
- [x] Document versioning policy: semver, breaking changes require major bump
      and downstream coordination

### P1: Downstream Integration

- [x] **spectre-tokens** — assess which token values are static vs. reactive;
      establish the pattern for wiring reactive tokens through signals
      (see `docs/integration/spectre-tokens.md`)
- [x] **spectre-ui** — establish the pattern for consuming a signal inside a UI
      component (direct `.value` read in effect, or computed class/style state)
      (see `docs/integration/spectre-ui.md`)
- [x] **spectre-ui-astro** — define how signals initializes and tears down within
      an Astro island lifecycle; confirm `effect` cleanup works on component unmount
      (see `docs/integration/spectre-ui-astro.md`)

### P2: Integration Guide

- [x] Write a consuming-package integration guide covering: install, shared signal
      instances, `computed` and `effect` in a component context, cleanup patterns
      (see `docs/integration/guide.md`)
- [x] Add Astro-specific notes for island hydration and teardown
      (see `docs/integration/guide.md#astro-specific-notes-island-hydration-and-teardown`)

---

## Phase 4 — Ecosystem Hardening (demand-driven)

Do not start these until a concrete consuming-package need is proven. The
adoption trigger for each item is listed explicitly — do not infer demand.

### P0: Async Effect Support

- [ ] Add async-capable effect variant
  - **Trigger**: a downstream integration (spectre-ui-astro, spectre-shell, or
    a consuming app) has a reactive async workflow that cannot be expressed by
    scheduling async calls inside a synchronous `effect()`.
  - Acceptance: the synchronous `effect()` contract is unchanged; async variant
    is additive and does not affect the base reactive model.

### P1: DevTools Hook

- [ ] Expose a reactive graph inspection hook
  - **Trigger**: debugging reactive graphs becomes a concrete pain point raised
    by a downstream package maintainer, not just a theoretical nicety.
  - Acceptance: hook is opt-in and tree-shakeable; zero cost when not used.

---

## Upcoming Release: v1.2.0 ← NEXT ACTION

All implementation is done. The following `[Unreleased]` items are queued and ready to ship:

- Integration docs: `docs/integration/` (spectre-tokens, spectre-ui, spectre-ui-astro, guide.md)
- Versioning policy: `docs/versioning-policy.md`
- Ecosystem manifest: `spectre.manifest.json` + `check:ecosystem`

Steps to release:

1. Run `npm run release:propose` — confirms the semver bump from `CHANGELOG.md [Unreleased]`
2. Move `[Unreleased]` entries to the new version header in `CHANGELOG.md`
3. Bump `version` in `package.json`
4. Run `npm run check` — must pass clean
5. Hand off to Bradley Potts for tag and publish

---

## Recommended Execution Order

1. Phase 1 — done.
2. Phase 2 — done.
3. Phase 3 — done.
4. **Release v1.2.0** — publish integration docs and manifest work.
5. Phase 4 P0 — async effects only when a downstream need is proven.
6. Phase 4 P1 — DevTools hook only when debugging becomes a real pain point.

## Explicitly Out of Scope

- Do not add stores, atoms, selectors, or app-wide state containers
- Do not add framework adapters (React, Vue, Solid, etc.)
- Do not add persistence or localStorage helpers
- Do not add async resources or query layers
- Do not add event buses or observable streams
- Do not add DOM binding helpers or rendering lifecycle
