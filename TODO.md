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

## Phase 3 — Integration & Adoption

The foundation is solid and published. This phase moves signals from a standalone
package into active use across the Spectre stack.

### P0: Publish Confirmation

- [ ] Publish `@phcdevworks/spectre-shell-signals@1.1.0` to npm
- [ ] Confirm published package is consumable from Node and browser
      (ESM + CJS, types resolve, `import` and `require` both work)
- [ ] Document versioning policy: semver, breaking changes require major bump
      and downstream coordination

### P1: Downstream Integration

- [ ] **spectre-tokens** — assess which token values are static vs. reactive;
      establish the pattern for wiring reactive tokens through signals
- [ ] **spectre-ui** — establish the pattern for consuming a signal inside a UI
      component (direct `.value` read in effect, or computed class/style state)
- [ ] **spectre-ui-astro** — define how signals initializes and tears down within
      an Astro island lifecycle; confirm `effect` cleanup works on component unmount

### P2: Integration Guide

- [ ] Write a consuming-package integration guide covering: install, shared signal
      instances, `computed` and `effect` in a component context, cleanup patterns
- [ ] Add Astro-specific notes for island hydration and teardown

---

## Recommended Execution Order

1. Phase 1 — done.
2. Phase 2 — done.
3. Phase 3 P0 — confirm v1.1.0 is consumable from Node and browser.
4. Phase 3 P1 — spectre-tokens integration assessment.
5. Phase 3 P1 — spectre-ui integration pattern.
6. Phase 3 P1 — spectre-ui-astro lifecycle integration.
7. Phase 3 P2 — consuming-package integration guide.
8. Phase 4 — async effects / DevTools only when proven necessary.

## Explicitly Out of Scope

- Do not add stores, atoms, selectors, or app-wide state containers
- Do not add framework adapters (React, Vue, Solid, etc.)
- Do not add persistence or localStorage helpers
- Do not add async resources or query layers
- Do not add event buses or observable streams
- Do not add DOM binding helpers or rendering lifecycle
