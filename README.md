# @phcdevworks/spectre-shell-signals

[![GitHub issues](https://img.shields.io/github/issues/phcdevworks/spectre-shell-signals)](https://github.com/phcdevworks/spectre-shell-signals/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/phcdevworks/spectre-shell-signals)](https://github.com/phcdevworks/spectre-shell-signals/pulls)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-shell-signals)](LICENSE)

`@phcdevworks/spectre-shell-signals` is the minimal reactive-primitives package
for Spectre applications.

Maintained by PHCDevworks as part of the Spectre suite, it provides a small,
framework-agnostic foundation for writable signals, derived values, and
reactive effects. The package is intentionally narrow: it owns primitive
reactivity only so sibling packages can build on predictable synchronous
semantics without inheriting a broader state-management framework.

## Key capabilities

- Writable signals with explicit `.value` reads and writes
- Lazy computed values with dependency tracking and cached recomputation
- Reactive effects with cleanup before re-run and on disposal
- Synchronous, readable behavior that is portable across runtimes
- Small public API surface designed to resist scope drift

## Installation

```bash
npm install @phcdevworks/spectre-shell-signals
```

## Quick start

```ts
import { computed, effect, signal } from '@phcdevworks/spectre-shell-signals'

const count = signal(0)
const doubled = computed(() => count.value * 2)

const stop = effect(() => {
  console.log(doubled.value)
})

count.value = 1
stop()
```

Effects can also register cleanup work that runs before the next execution and when the effect is disposed:

```ts
import { effect, signal } from '@phcdevworks/spectre-shell-signals'

const enabled = signal(true)

const stop = effect((onCleanup) => {
  if (!enabled.value) {
    return
  }

  const id = setInterval(() => {
    console.log('tick')
  }, 1000)

  onCleanup(() => clearInterval(id))
})

enabled.value = false
stop()
```

## What this package owns

- `signal<T>(initialValue)` for writable reactive values
- `computed<T>(fn)` for lazy derived values
- `effect(fn)` for reactive side effects
- Dependency tracking, invalidation, and cleanup/disposal behavior
- Minimal TypeScript types for the public API

This package should stay at the primitive reactivity layer.

## What this package does not own

- Global stores, app-wide state containers, or business logic state layers
- Routers, navigation state, URL params, or shell orchestration
- DOM bindings, renderer integrations, or framework lifecycle adapters
- Async cache/query behavior, persistence, streams, or event buses
- Devtools, inspectors, dashboards, or plugin systems

If a feature is not directly required for `signal`, `computed`, `effect`, tracking, invalidation, or disposal, it does not belong here.

## Package exports / API surface

Runtime exports:

- `signal`
- `computed`
- `effect`

Type exports:

- `Signal<T>`
- `Computed<T>`
- `EffectCallback`
- `EffectCleanup`
- `StopEffect`

Behavior summary:

- `signal(initialValue)` returns an object with a tracked `.value` getter and invalidating setter
- `computed(fn)` is lazy, cached, and recomputes only when read after invalidation
- `effect(fn)` runs immediately, tracks reads during execution, and returns a stop function
- `onCleanup` handlers run before the next effect execution and when the effect is stopped
- Signal writes use `Object.is` to skip unchanged updates

## Relationship to the rest of Spectre

Spectre keeps responsibilities separate:

- `@phcdevworks/spectre-tokens` owns visual language, semantic roles, and token contracts
- `@phcdevworks/spectre-ui` owns token-driven styling, Tailwind helpers, and class recipes
- `@phcdevworks/spectre-shell` owns thin shell composition and runtime surface
- `@phcdevworks/spectre-shell-router` owns URL resolution and navigation primitives
- `@phcdevworks/spectre-shell-signals` owns reactive primitives only

That separation keeps the reactivity layer portable and prevents it from
becoming a general-purpose runtime or state framework.

## Development

Install dependencies, then run the package checks:

```bash
npm run build
npm test
npm run check
```

Key source areas:

- `src/signal.ts`
- `src/computed.ts`
- `src/effect.ts`
- `src/internals/node.ts`
- `src/internals/tracking.ts`
- `tests/signals.test.ts`

## Contributing

When contributing:

- keep the API tiny and explicit
- prefer implementation clarity over abstraction-heavy design
- avoid adding framework concepts or store-like helpers
- add tests before changing reactive semantics
- run `npm run build`, `npm test`, and `npm run check` before opening a pull
  request

Scope discipline is part of the package contract.

## License

MIT © PHCDevworks. See [LICENSE](LICENSE).
