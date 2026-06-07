# Spectre Shell Signals Roadmap

`@phcdevworks/spectre-shell-signals` is the minimal reactive-primitives package
for the Spectre shell system. It exposes `signal`, `computed`, `effect`, `batch`,
and directly related types — and nothing else. The scope is intentionally tiny
and must stay that way.

---

## 1. Phase 1 — Foundation — Delivered

All foundation work is complete as of v1.0.0.

### Foundation delivered

- `signal<T>` with tracked reads and guarded writes.
- `computed<T>` with lazy derivation, caching, and explicit `dispose()`.
- `effect()` with dependency tracking, synchronous cleanup, and a stop function.
- `Node` subscriber registry and `tracking.ts` activeObserver stack as private
  internals — not exported.
- Public types: `Signal`, `Computed`, `EffectCallback`, `EffectCleanup`,
  `CleanupRegistrar`, `StopEffect`.
- Dual ESM/CJS output via tsup. TypeScript 6 with strict mode.
- `npm run check` gate: typecheck, lint, build, and test.
- CI on Node 22 and 24.
- README, CONTRIBUTING, ROADMAP, and AI-agent coordination docs.

### Permanent constraints

- `src/internals/` remains private. `Node` and `tracking.ts` are never exported.
- The synchronous reactive model is the contract. No async scheduler is added
  speculatively.
- This package does not own DOM binding, framework adapters, stores, or
  persistence.

---

## 2. Phase 2 — Mature Operations — Delivered

All Phase 2 work is complete as of v1.1.0.

### Ergonomics and ecosystem delivered

- **`signal.peek()`** — untracked read. Reads current value without registering
  a dependency, so the caller does not re-run when the signal changes.
- **`batch(fn)`** — deferred subscriber notification. Effects in diamond-dependency
  graphs run once per batch rather than once per signal write. Nested calls defer
  until the outermost batch ends.
- **`EffectOptions.onError`** — optional error handler for `effect()`. When
  provided, errors thrown inside the effect callback are passed to `onError`
  instead of propagating. The effect stays active and re-runs on the next
  dependency change.
- **Computed stability audit** — confirmed and tested that no-op signal writes do
  not re-derive downstream computed values or re-run downstream effects.
- **Ecosystem manifest** — `spectre.manifest.json` declares this package's role,
  layer, exports, and allowed dependency targets. `check:ecosystem` validates it
  in the full check gate.
- **35-case test suite** — covers all ergonomic additions alongside the full
  Phase 1 behavioral contract.
- v1.1.0 published to npm.

---

## 3. Phase 3 — Integration & Adoption

The foundation is stable and published. This phase moves signals from a
standalone package into active use across the Spectre stack. This is not about
adding primitives — it is about making the existing primitives the foundation
the downstream packages build on.

### P0: Publish Confirmation

- Confirm the published v1.1.0 package is consumable from Node and browser
  environments (ESM + CJS, types resolve correctly).
- Establish the versioning policy explicitly: signals follows semver; breaking
  API changes require a major bump and downstream coordination.

### P1: Downstream Integration

The three active consuming targets, in dependency order:

**`spectre-tokens`** — Reactive token contracts  
Token values that respond to theme, user preference, or runtime state should
be wired through signals rather than ad-hoc patterns. Integration goal: identify
which token values are static vs. reactive and establish the consumption pattern.

**`spectre-ui`** — Token-driven styling and class recipes  
UI components need reactive class or style state driven by signals (active,
disabled, theme, etc.). Integration goal: establish the pattern for consuming a
signal inside a UI component — direct `.value` read inside an effect, or a
computed that derives class state from one or more signals.

**`spectre-ui-astro`** — Astro component layer  
Astro's island architecture means client-side reactivity lives in hydrated
components. Integration goal: define how signals initializes and tears down
within an Astro island lifecycle; confirm `effect` cleanup plays correctly with
component unmount.

### P2: Integration Guide

- Write a consuming-package integration guide (separate doc, not inline in
  README).
- Cover: installing the package, creating shared signal instances, using
  `computed` and `effect` in a component context, cleanup and disposal patterns.
- Keep the guide framework-agnostic where possible; Astro-specific teardown
  notes in a separate section.

---

## 4. Phase 4 — Ecosystem Hardening (demand-driven)

These are only pursued if a concrete consuming-package need is proven:

- **Async effect support** — only if an integration requires reactive async work
  that cannot be handled by scheduling async calls inside a synchronous effect.
- **DevTools hook** — only if debugging reactive graphs becomes a real pain point
  across the consuming packages.

Do not add either speculatively.

---

## 5. Explicitly Out of Scope

- Stores, atoms, selectors, or app-wide state containers
- Framework adapters (React, Vue, Solid, Astro-specific hooks)
- Persistence, localStorage, or sessionStorage helpers
- Async resources or query layers
- Event buses or observable streams
- Middleware, plugins, or scheduler complexity
- DOM binding helpers or rendering lifecycle

---

## 6. Recommended Execution Order

1. **Phase 1** — done.
2. **Phase 2** — done.
3. **Phase 3 P0** — confirm v1.1.0 is consumable from Node and browser.
4. **Phase 3 P1** — spectre-tokens integration assessment.
5. **Phase 3 P1** — spectre-ui integration pattern.
6. **Phase 3 P1** — spectre-ui-astro lifecycle integration.
7. **Phase 3 P2** — consuming-package integration guide.
8. **Phase 4** — async effects / DevTools only when proven necessary.
