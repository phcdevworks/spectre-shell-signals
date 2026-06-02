# Decision: Async Effect Support

**Status:** Not adopted  
**Date:** 2026-06-02  
**Scope:** `spectre-shell-signals` reactive primitive layer

## Question

Should `effect()` support async callbacks — i.e., callbacks that return a `Promise`?

## Context

Several reactive libraries (SolidJS `createResource`, Vue `watchEffect` with
`onInvalidate`, RxJS) offer async-aware primitives. The appeal is handling
data-fetching or async state transitions inside a reactive graph.

## Decision: Do Not Implement

Async effects are explicitly out of scope for this package. The reasons:

**Correctness is undefined.** An async callback reads dependencies across
multiple microtask ticks. Dependencies captured after the first `await` belong
to a resumed continuation, not to the effect's reactive frame. The semantics
of "what is this effect subscribed to" become ambiguous and implementation-
specific.

**Cleanup timing breaks.** The cleanup contract — run cleanup before re-run,
run cleanup on disposal — relies on synchronous execution. An async body may
still be running when a dependency changes or when `stop()` is called.
Cancellation would require an `AbortController` or similar mechanism threaded
through every async body, which is application-level responsibility, not
primitive-level.

**This is a reactive primitives package, not a data-fetching layer.** Resources,
loaders, and async query state belong in a consuming package built on top of
these primitives. Keeping this layer synchronous preserves the ability to reason
about the reactive graph deterministically.

**Workaround is clean.** Callers needing async work inside an effect can use a
synchronous signal to bridge:

```ts
const data = signal<Data | null>(null);

effect(() => {
  const id = selectedId.value; // tracked dependency
  fetchData(id).then((result) => {
    data.value = result; // write back from async context, untracked
  });
});
```

This pattern is explicit about what is tracked and when the result lands.

## Revisit Criteria

Reconsider only if:

1. A consuming package demonstrates a concrete case the workaround cannot
   handle.
2. A well-specified async-effect semantics proposal (with defined cancellation,
   cleanup, and subscription rules) is presented for review.

Demand-driven, not speculative.
