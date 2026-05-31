# Spectre Shell Signals Roadmap

This roadmap is grounded in the current repository shape and public contract of
`@phcdevworks/spectre-shell-signals` as it exists today.

`@phcdevworks/spectre-shell-signals` is the minimal reactive-primitives package
for the Spectre shell system. It exposes three primitives — `signal`,
`computed`, `effect` — and nothing else. The scope is intentionally tiny and
must stay that way.

The work below focuses on hardening the existing reactive contract toward a
stable, dependable foundation for consuming packages — not expanding scope.

## 1. Current Repo Assessment

### Current strengths

- `signal`, `computed`, and `effect` are implemented with correct reactive
  semantics: tracked reads, write propagation, lazy computation, and
  synchronous effect execution.
- `computed.dispose()` releases tracked dependencies cleanly.
- Internals (`Node`, `tracking.ts`) are private and not exported.
- Behavioral test suite covers 19 cases including unchanged-write guards,
  computed caching, dependency switching, circular protection, and cleanup
  on disposal.
- Dual ESM/CJS output via `tsup`.
- CI runs `npm run check` on Node 22 and 24.

### Delivered since initial release

- `Signal.peek()` - reads current value without registering a dependency
  (delivered in v0.3.0).
- `batch()` - defers subscriber notification across multiple synchronous writes
  (delivered in v0.3.0).
- Computed stability under no-op writes - audited and confirmed correct.

### Remaining gaps to address

- Computed values may re-derive on every access in some edge cases under
  certain invalidation patterns (lower priority; audit pending).

## 2. Roadmap

## P0: Reactive Correctness / Must-Do

### P0.1 Signal `peek()` Method -- DELIVERED

`peek(): T` is implemented on `Signal<T>`. It bypasses the tracking stack
entirely. Tests confirm no dependency is registered when `peek()` is called
inside effects or computed bodies. Documented in `README.md`.

### P0.2 Effect Error Boundary -- DELIVERED

`effect(fn, { onError })` is implemented. Errors thrown inside an effect
callback are passed to `onError` when provided; the effect stays active and
re-runs normally on the next dependency change. Default behavior (no `onError`)
continues to throw synchronously. Tests cover propagation by default, `onError`
on initial and re-run, re-run after error, and cleanup ordering on error.
Documented in `README.md`.

## P1: Reactive Ergonomics

### P1.1 Effect Batching -- DELIVERED

`batch(fn: () => void): void` is implemented and exported. Signal writes inside
`batch()` defer subscriber notification until the batch ends. Effects run once
per batch, not once per signal write. Tests cover diamond graphs, nested
batches, and batch + cleanup interaction. Documented in `README.md`.

### P1.2 `computed` Stability Under No-Change Writes -- DELIVERED

Audited and confirmed correct. No-op writes (`signal.value = signal.value`) do
not invalidate dependents through computed chains. Test coverage added.

## P2: Later / Controlled Improvement

### P2.1 Async Effect Support (Evaluate Only)

Objective Evaluate whether `effect()` should support async callbacks.

Why it matters Some consumers want to run async side effects reactively.
Async effects introduce complexity around cancellation, cleanup ordering, and
concurrent execution.

Suggested deliverables

- Decision document only — implement only if a concrete consumer need is proven
- Do not add async primitives speculatively

### P2.2 DevTools Hook (Evaluate Only)

Objective Evaluate whether a minimal debug hook (`__DEV__` only) is useful for
inspecting reactive graphs.

Dependency notes

- Implement only if adoption and debugging pain justify the surface area

## 3. Explicitly Out of Scope

- Do not add stores, atoms, selectors, or app-wide state containers
- Do not add framework adapters (React, Vue, Solid, etc.)
- Do not add persistence, localStorage, or sessionStorage helpers
- Do not add async resources or query layers
- Do not add event buses or observable streams
- Do not add middleware, plugins, or scheduler complexity

## 4. Recommended Execution Order

1. ~~Signal `peek()` method~~ -- delivered
2. ~~Effect error boundary~~ -- delivered
3. ~~Effect batching~~ -- delivered
4. ~~Computed stability audit~~ -- delivered
5. Evaluate async effects only when a proven consumer need exists
6. Evaluate DevTools hook only when adoption justifies it
