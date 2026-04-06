# AGENTS.md

# @phcdevworks/spectre-signals

## Mission

`@phcdevworks/spectre-signals` is the minimal reactive primitives package for the Spectre system.

It provides a small, framework-agnostic foundation for local reactive state, derived values, and reactive effects. Its job is to expose a tiny, predictable reactivity layer that other Spectre packages and compatible applications can build on without inheriting a full state-management framework.

This package must stay narrow, explicit, portable, and easy to reason about.

---

## Package role

This package owns primitive reactivity only.

It exists to provide:

- writable signals
- lazy computed values
- reactive effects
- dependency tracking
- invalidation
- cleanup and disposal behavior

It does **not** exist to define application architecture.

---

## What this package owns

Agents may work on:

- `signal<T>(initialValue)`
- `computed<T>(fn)`
- `effect(fn)`
- tracked `.value` reads and writes
- dependency collection and invalidation
- cleanup behavior before effect re-run and on disposal
- predictable synchronous semantics
- small TypeScript types for the public API
- tests that lock reactive behavior and edge cases
- documentation that protects scope and clarifies ownership
- packaging, validation, and release hygiene for this package only

---

## What this package does not own

Agents must not add or expand into:

- global store architecture
- app-wide state containers
- business/domain state modeling
- router or URL state
- shell orchestration
- component rendering
- DOM binding helpers
- React, Vue, Solid, Astro, or framework-specific adapters
- async cache/query layers
- persistence or localStorage/sessionStorage helpers
- event buses
- streams or observable abstractions
- selectors as a store pattern
- middleware systems
- plugin systems
- devtools, inspectors, dashboards, or debugging overlays
- scheduler complexity beyond minimal reactive correctness
- speculative extension hooks for future use

If a proposed feature is not directly required for `signal`, `computed`, `effect`, dependency tracking, invalidation, cleanup, or disposal, it does not belong in this repository.

---

## Design rules

When making changes:

1. Keep the API tiny.
2. Prefer explicit behavior over magical behavior.
3. Prefer readable internals over abstraction-heavy architecture.
4. Protect synchronous, predictable semantics unless there is a strong reason not to.
5. Do not introduce new exports casually.
6. Do not build “for later.”
7. Do not add framework concepts.
8. Do not turn primitives into a store library.

This package should feel small enough that another maintainer can understand the full runtime model quickly.

---

## Public API discipline

The intended public API is minimal:

- `signal`
- `computed`
- `effect`

Related exported types are acceptable when they directly describe the existing runtime API.

Agents must not add new runtime exports unless they are clearly necessary to preserve or clarify the primitive reactivity contract.

Before adding any export, ask:

- Does this directly support primitive reactivity?
- Is this required now, not hypothetically later?
- Would this make the package feel more like a store or framework runtime?

If there is any doubt, do not add it.

---

## Allowed work

Good contributions include:

- fixing dependency-tracking bugs
- improving computed invalidation correctness
- tightening cleanup/disposal behavior
- strengthening tests for reactive semantics
- clarifying README ownership boundaries
- improving package metadata and release hygiene
- adding CI validation for build, test, and type-check flows
- simplifying internals without changing package scope

---

## Disallowed work

Do not introduce:

- `createStore`
- `selector`
- `atom`
- `resource`
- `watch`
- `subscribe` as a broader external event API
- framework hooks like `useSignal`
- persistence helpers like `persistSignal`
- router-integrated state helpers
- async signal resources
- transaction systems unless absolutely required for correctness
- plugin registration patterns
- debugging panels or devtools protocols

These features may be valid elsewhere, but they do not belong here.

---

## Repository boundaries

This package should remain aligned with the broader Spectre split of responsibilities:

- `@phcdevworks/spectre-tokens` owns visual language and token contracts
- `@phcdevworks/spectre-ui` owns token-driven styling and class recipes
- `@phcdevworks/spectre-shell` owns thin shell composition/runtime surface
- `@phcdevworks/spectre-shell-router` owns routing primitives
- `@phcdevworks/spectre-signals` owns reactive primitives only

Do not pull responsibilities across those lines.

---

## Validation requirements

Before finishing work, agents should run the relevant checks that exist in this repo:

    npm run build
    npm test
    npm run check

If linting or other validation scripts exist and are part of the active workflow, run them too.

Do not claim success without reporting what actually ran.

---

## Test expectations

Reactive packages drift when semantics are changed casually. Tests are part of the package contract.

Changes that affect behavior should add or update coverage for cases such as:

- signal read/write behavior
- unchanged writes not notifying dependents
- computed laziness
- computed caching
- dependency invalidation
- effect initial execution
- cleanup before re-run
- cleanup on disposal
- dependency switching
- nested computed values
- multiple subscribers
- circular/self-referential protection where applicable

Do not change semantics without tests that prove the intended behavior.

---

## Documentation requirements

README and package metadata must stay aligned with the actual implementation.

Agents must:

- keep the README narrow and package-oriented
- document only exports that actually exist
- reinforce non-goals to prevent drift
- avoid speculative roadmap language
- keep naming, repository URLs, badges, and package metadata consistent

If the repository name, package name, and docs are misaligned, fix that as part of repo hygiene.

---

## Change sizing

Prefer small, controlled changes.

Good:
- one semantic fix
- one documentation alignment pass
- one validation/CI improvement
- one metadata consistency fix

Avoid large mixed changes that combine:
- runtime redesign
- docs rewrite
- packaging changes
- test overhauls
- naming changes

Unless all are required to resolve one clearly bounded issue.

---

## Drift check before finalizing

Before submitting work, review the result against these questions:

- Is the package still reactive-primitives-only?
- Did any store-like concept leak in?
- Did any framework-specific concept leak in?
- Did the public API grow unnecessarily?
- Did docs promise anything not implemented?
- Did package metadata stay consistent with repo identity?

If any answer is yes, fix the drift before finishing.

---

## Default operating stance

When unsure, choose the smaller API, the narrower scope, the simpler implementation, and the clearer documentation.

This repository wins by staying disciplined.