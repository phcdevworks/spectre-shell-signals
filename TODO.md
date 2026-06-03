# Spectre Shell Signals Execution Todo

Scoped to reactive correctness, ergonomics, and hardening. Aligned to `ROADMAP.md`.

## Phase 1 - Foundation: Completed

All Phase 1 items were delivered during initial release. The package ships with
correct reactive semantics, a complete behavioral test suite, and a CI-validated
build gate.

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

- [x] Behavioral test suite (19 cases) covering: unchanged-write guards, computed
      caching, dependency switching, circular protection, cleanup on disposal
- [x] CI on Node 22 and 24 via `.github/workflows/ci.yml`

### P3: Documentation and Repo Hygiene

- [x] README aligned to public API with usage examples and package boundaries
- [x] CHANGELOG.md, CONTRIBUTING.md, ROADMAP.md, and AI agent coordination docs

---

## Phase 2 - Mature Operations: Completed

All Phase 2 items are delivered and validated.

### P0: Reactive Correctness

- [x] `signal.peek()` — untracked read, no dependency registration
- [x] Effect error boundary — `onError` option, effect stays active after error

### P1: Reactive Ergonomics

- [x] `batch()` — deferred notification for diamond graphs and multi-write scenarios
- [x] Computed stability audit — no-op writes confirmed not to invalidate dependents

### P2: Evaluation Documents

- [x] Async effect support decision document
- [x] DevTools hook decision document

---

## Phase 3 - Integration & Adoption

The foundation is solid. This phase moves signals from a standalone package into
active use across the Spectre stack.

### P0: Release

- [x] Cut CHANGELOG `[Unreleased]` to `[1.1.0]` with `peek`, `batch`, `onError`
- [x] Bump `package.json` version to `1.1.0`
- [ ] Publish `@phcdevworks/spectre-shell-signals@1.1.0` to npm
- [ ] Confirm published package is consumable (ESM + CJS, types resolve correctly)

### P1: Downstream Integration

- [ ] **spectre-tokens** — assess which token values are static vs. reactive;
      wire reactive tokens through signals rather than ad-hoc patterns
- [ ] **spectre-ui** — establish the pattern for consuming a signal inside a UI
      component (direct `.value` read in effect, or computed class/style state)
- [ ] **spectre-ui-astro** — define how signals initializes and tears down within
      an Astro island lifecycle; confirm `effect` cleanup works on component unmount

### P2: Documentation

- [ ] Write a consuming-package integration guide covering: install, shared signal
      instances, computed and effect in a component context, cleanup patterns
- [ ] Add Astro-specific notes for island hydration and teardown

---

## Explicitly Out of Scope

- Do not add stores, atoms, selectors, or app-wide state containers
- Do not add framework adapters (React, Vue, Solid, etc.)
- Do not add persistence or localStorage helpers
- Do not add async resources or query layers
- Do not add event buses or observable streams
