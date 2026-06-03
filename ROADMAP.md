# Spectre Shell Signals Roadmap

`@phcdevworks/spectre-shell-signals` is the minimal reactive-primitives package
for the Spectre shell system. It exposes `signal`, `computed`, `effect`, `batch`,
and directly related types — and nothing else. The scope is intentionally tiny
and must stay that way.

## 1. Current State

The reactive foundation is stable and complete.

- `signal`, `computed`, `effect`, `batch`, and `peek()` are implemented with
  correct semantics and a full behavioral test suite.
- Effect error boundaries (`onError`) are implemented.
- Dual ESM/CJS output, strict TypeScript 6, and CI on Node 22 and 24.
- v1.0.0 published. v1.1.0 work (`peek`, `batch`, `onError`) is complete but
  unreleased — CHANGELOG `[Unreleased]` is ready to cut.

The package is ready for consumption. The next phase is integration.

## 2. Phase 3 — Integration & Adoption

The goal is to get signals actively used across the Spectre stack. This is not
about adding primitives — it is about making the existing primitives the
foundation the downstream packages build on.

### P0: Release and Publish

- Cut CHANGELOG `[Unreleased]` to `[1.1.0]` and publish to npm.
- Confirm the published package is consumable from Node and browser environments.
- Establish a versioning policy: signals follows semver; breaking API changes
  require a major bump and downstream coordination.

### P1: Downstream Integration

The three active consuming targets, in dependency order:

**`spectre-tokens`** — Reactive token contracts  
Tokens may have theme-driven, user-overridable, or computed values. If any token
needs to react to runtime state, signals is the primitive to reach for. Integration
goal: identify which token values are static vs. reactive, and wire reactive ones
through signals rather than ad-hoc patterns.

**`spectre-ui`** — Token-driven styling and class recipes  
UI components may need reactive class or style state driven by signals (active,
disabled, theme, etc.). Integration goal: establish the pattern for how a UI
component consumes a signal — direct `.value` read inside an effect, or a
computed that derives class state from one or more signals.

**`spectre-ui-astro`** — Astro component layer  
Astro's island architecture means client-side reactivity lives in hydrated
components. Integration goal: define how signals initializes and tears down
within an Astro island lifecycle; confirm `effect` cleanup plays correctly with
component unmount.

### P2: Integration Guide

- Write a consuming-package integration guide (separate doc, not inline in README).
- Cover: installing the package, creating shared signal instances, using computed
  and effect in a component context, cleanup and disposal patterns.
- Keep it framework-agnostic where possible; Astro-specific notes in a separate
  section.

## 3. Phase 4 — Ecosystem Hardening (demand-driven)

These are only pursued if a concrete consuming-package need is proven:

- **Async effect support** — only if an integration requires reactive async work
  that cannot be handled by scheduling async calls inside a synchronous effect.
- **DevTools hook** — only if debugging reactive graphs becomes a real pain point
  across the consuming packages.

Do not add either speculatively.

## 4. Explicitly Out of Scope

- Stores, atoms, selectors, or app-wide state containers
- Framework adapters (React, Vue, Solid, Astro-specific hooks)
- Persistence, localStorage, or sessionStorage helpers
- Async resources or query layers
- Event buses or observable streams
- Middleware, plugins, or scheduler complexity
- DOM binding helpers or rendering lifecycle

## 5. Execution Order

1. Cut and publish v1.1.0
2. spectre-tokens integration assessment
3. spectre-ui integration pattern
4. spectre-ui-astro lifecycle integration
5. Consuming-package integration guide
6. Async effects / DevTools only when proven necessary
