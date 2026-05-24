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

## Phase 2 - Mature Operations

All items below are forward-looking. This phase hardens the reactive contract
toward a stable, dependable foundation for consuming packages.

### P0: Reactive Correctness / Must-Do

- [ ] Add `peek()` to `Signal<T>`
  - `signal.peek()` reads the current value without registering a dependency
  - Bypasses the tracking stack entirely
  - Tests: `peek()` inside effects and computed bodies does not create subscriptions
  - Document under public API in `README.md`

- [ ] Add effect error boundary
  - Add optional `onError?: (err: unknown) => void` to `effect()` options
  - Default behavior: re-throw synchronously (no silent swallow)
  - Tests: error handling, re-run after error, cleanup on error
  - Document error boundary behavior in `README.md`

### P1: Reactive Ergonomics

- [ ] Add `batch()` export for synchronous write batching
  - `batch(fn)` defers subscriber notification until `fn` returns
  - Effects run once per batch, not once per signal write
  - Tests: diamond graphs, nested batches, batch + cleanup interaction
  - Document in `README.md`

- [ ] Audit computed stability on no-op writes
  - Confirm no-op writes (`signal.value = signal.value`) do not invalidate
    dependents through computed chains
  - Add or expand tests covering full invalidation paths
  - Fix any path that skips the equality check

### P2: Later / Controlled Improvement

- [ ] Evaluate async effect support (decision document only - no implementation
  until proven need)
- [ ] Evaluate DevTools hook (decision document only - no implementation until
  adoption justifies it)

## Recommended Execution Order

1. Signal `peek()` method (unblocks consuming packages immediately)
2. Effect error boundary (reliability for production use)
3. Effect batching (performance correctness for diamond graphs)
4. Computed stability audit
5. Async effects evaluation (demand-driven)
6. DevTools hook evaluation (adoption-driven)

## Explicitly Out of Scope

- Do not add stores, atoms, selectors, or app-wide state containers
- Do not add framework adapters (React, Vue, Solid, etc.)
- Do not add persistence or localStorage helpers
- Do not add async resources or query layers
- Do not add event buses or observable streams
