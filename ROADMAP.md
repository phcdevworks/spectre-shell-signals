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

## 3. Phase 3 — Integration & Adoption — Delivered

All Phase 3 work is complete. Integration documentation and versioning policy
are written; the ecosystem manifest is wired into the check gate. These items
are queued for the v1.2.0 release.

### What was delivered

- **Integration docs** — `docs/integration/` covers all three downstream targets:
  `spectre-tokens` (static vs. reactive token assessment), `spectre-ui` (signal
  consumption inside UI components), and `spectre-ui-astro` (island hydration and
  `StopEffect` teardown).
- **Integration guide** — `docs/integration/guide.md` covers the full consuming-
  package pattern: install, shared signal instances, `computed` and `effect` in
  component context, cleanup, and Astro-specific teardown notes.
- **Versioning policy** — `docs/versioning-policy.md` documents the semver
  contract and downstream coordination protocol for major releases.
- **Ecosystem manifest** — `spectre.manifest.json` + `check:ecosystem` in the
  full check gate.

### Next release: v1.2.0 ← NEXT ACTION

Release metadata is prepared for v1.2.0 and the full validation gate passes.
Bradley Potts retains final authority for the release commit, tag, and npm
publication.

No implementation work is needed before this release.

---

## 4. Phase 4 — Ecosystem Hardening (demand-driven)

These are only pursued when a concrete consuming-package need is proven.
Do not start either speculatively.

### Async effect support

**Adoption trigger**: a downstream integration has a reactive async workflow
that cannot be expressed by scheduling async calls inside a synchronous
`effect()`. If synchronous `effect()` can handle the use case (even awkwardly),
this is not triggered.

When triggered: additive async variant that does not change the synchronous
`effect()` contract; zero impact on consumers not using the async variant.

### DevTools hook

**Adoption trigger**: debugging reactive dependency graphs becomes a concrete
pain point reported by a downstream package maintainer. Theoretical value does
not count.

When triggered: opt-in, tree-shakeable inspection hook; zero cost when not
activated.

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

1. ~~Phase 1~~ ✓
2. ~~Phase 2~~ ✓
3. ~~Phase 3~~ ✓
4. **Release v1.2.0** ← next (run `npm run release:propose`, hand off to Bradley Potts)
5. Phase 4 — async effects / DevTools only when adoption trigger is met.
