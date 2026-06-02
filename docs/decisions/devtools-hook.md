# Decision: DevTools Hook

**Status:** Not adopted  
**Date:** 2026-06-02  
**Scope:** `spectre-shell-signals` reactive primitive layer

## Question

Should `spectre-shell-signals` expose a DevTools hook — a callback or observable
that external tooling can subscribe to for signal reads, writes, effect runs, and
computed invalidations?

## Context

Libraries like MobX and SolidJS expose internal instrumentation hooks that power
browser devtools extensions (reactive graph visualization, time-travel, change
logging). The value comes when a library has enough adoption that users need
runtime introspection to debug reactive behavior.

## Decision: Do Not Implement

A DevTools hook is explicitly deferred until adoption justifies it. The reasons:

**No users yet.** DevTools infrastructure serves debugging at scale — many
signals, many effects, complex reactive graphs. At zero or early adoption, the
cost of maintaining a stable instrumentation API is all overhead and no benefit.

**Hook design is adoption-informed.** What a DevTools hook should surface
(signal identity, effect names, computed chains, batch boundaries) depends on
what real users actually need to debug. Building it speculatively risks
designing the wrong API and locking it in before feedback is available.

**It increases the API surface permanently.** Once a hook is exported and
documented, removing or changing it is a breaking change. Adding it prematurely
constrains future implementation freedom (e.g., internal refactors to `Node` or
`tracking.ts` would become breaking).

**Internals are intentionally private.** `Node` and `tracking.ts` are not
exported. A DevTools hook would require either exposing them or building a stable
instrumentation facade on top — both are architectural commitments that should
follow, not lead, adoption.

## Revisit Criteria

Reconsider when:

1. The package has meaningful downstream adoption (consuming packages in active
   use).
2. A specific debugging pain point is reported that cannot be addressed by
   existing primitives (e.g., wrapping signals in logging proxies).
3. A stable, minimal hook API can be designed without exposing internal types.

Adoption-driven, not speculative.
