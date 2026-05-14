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

### Current gaps to address

- Effect batching is not implemented — diamond-dependency graphs trigger
  redundant effect runs.
- Computed values re-derive on every access even when no dependency has
  changed in some edge cases under certain invalidation patterns.
- No `onError` hook for effects — uncaught errors in effects silently
  terminate the effect chain.
- There is no `peek()` on signals — reading a signal's value without
  registering a dependency requires workarounds.

## 2. Roadmap

## P0: Reactive Correctness / Must-Do

### P0.1 Signal `peek()` Method

Objective Add a `peek()` method to `Signal<T>` for reading the current value
without registering a dependency.

Why it matters Some consumers need to read signal state inside effects or
computed functions without creating a dependency (e.g. reading a cache signal
inside an effect that should only react to a trigger signal). Without `peek()`,
consumers use workarounds that break tracking invariants.

Suggested deliverables

- Add `peek(): T` to the `Signal<T>` type and implementation
- `peek()` bypasses the tracking stack entirely
- Tests for `peek()` inside effects and computed bodies
- Document in `README.md` under public API

Dependency notes

- No upstream dependencies; can start immediately

Risk if skipped

- Consumers implement manual tracking bypasses that are fragile and untested

### P0.2 Effect Error Boundary

Objective Allow effects to handle errors without silently dying.

Why it matters An uncaught error inside an effect currently propagates
unhandled, terminating the effect and leaving reactive state in limbo. This
makes debugging production issues difficult.

Suggested deliverables

- Add optional `onError?: (err: unknown) => void` to `effect()` options
- Default behavior continues to throw synchronously (no silent swallow)
- Tests for error handling, re-run after error, and cleanup on error
- Document error boundary behavior in `README.md`

Dependency notes

- No upstream dependencies; can run alongside P0.1

Risk if skipped

- Reactive errors in consuming applications are hard to diagnose

## P1: Reactive Ergonomics

### P1.1 Effect Batching

Objective Batch synchronous signal writes so effects run once per batch rather
than once per write.

Why it matters Diamond-dependency patterns (one effect depends on two signals
that are written together) trigger redundant effect runs. Batching eliminates
unnecessary work and is the standard primitive in reactive systems.

Suggested deliverables

- Add a `batch(fn: () => void): void` export
- Signal writes inside `batch()` defer subscriber notification until the batch
  ends
- Effects run once per batch, not once per signal write
- Tests for diamond graphs, nested batches, and batch + cleanup interaction
- Document in `README.md`

Dependency notes

- Should be done after P0 correctness work is stable

Risk if skipped

- High-frequency writes cause redundant effect execution and performance issues
  in consuming packages

### P1.2 `computed` Stability Under No-Change Writes

Objective Ensure computed values do not re-derive when a signal is written with
the same value.

Why it matters `signal.value = signal.value` should not invalidate dependents.
This is already guarded on signal writes but worth auditing through the full
invalidation path.

Suggested deliverables

- Audit and add tests covering no-op writes through computed chains
- Fix any discovered invalidation path that skips the equality check

Dependency notes

- Low effort; can run at any point

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

1. Signal `peek()` method (unblocks consuming packages immediately)
2. Effect error boundary (reliability for production use)
3. Effect batching (performance correctness for diamond graphs)
4. Computed stability audit
5. Evaluate async effects only when a proven consumer need exists
6. Evaluate DevTools hook only when adoption justifies it
