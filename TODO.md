# Spectre Shell Signals Execution Todo

Scoped to reactive correctness, ergonomics, and hardening. Aligned to `ROADMAP.md`.

## P0: Reactive Correctness / Must-Do

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

## P1: Reactive Ergonomics

- [ ] Add `batch()` export for synchronous write batching
  - `batch(fn)` defers subscriber notification until `fn` returns
  - Effects run once per batch, not once per signal write
  - Tests: diamond graphs, nested batches, batch + cleanup interaction
  - Document in `README.md`

- [ ] Audit computed stability on no-op writes
  - Confirm no-op writes (`signal.value = signal.value`) do not invalidate dependents through computed chains
  - Add or expand tests covering full invalidation paths
  - Fix any path that skips the equality check

## P2: Later / Controlled Improvement

- [ ] Evaluate async effect support (decision document only — no implementation until proven need)
- [ ] Evaluate DevTools hook (decision document only — no implementation until adoption justifies it)

## Explicitly Out of Scope

- Do not add stores, atoms, selectors, or app-wide state containers
- Do not add framework adapters (React, Vue, Solid, etc.)
- Do not add persistence or localStorage helpers
- Do not add async resources or query layers
- Do not add event buses or observable streams

## Execution Order

1. Signal `peek()` method
2. Effect error boundary
3. Effect batching
4. Computed stability audit
5. Async effects evaluation (demand-driven)
6. DevTools hook evaluation (adoption-driven)
