# @phcdevworks/spectre-shell-signals

[![GitHub issues](https://img.shields.io/github/issues/phcdevworks/spectre-shell-signals)](https://github.com/phcdevworks/spectre-shell-signals/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/phcdevworks/spectre-shell-signals)](https://github.com/phcdevworks/spectre-shell-signals/pulls)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-shell-signals)](LICENSE)

`@phcdevworks/spectre-shell-signals` is the reactive primitives layer for local
UI state in Spectre shells.

Maintained by PHCDevworks, it provides a tiny, framework-agnostic set of
building blocks for signal-based reactivity: writable signals, lazy computed
values, and reactive effects with cleanup. It is intentionally narrow. This
package is not a store library, not a router, and not an application state
container.

The package exists so shells, adapters, and lightweight runtimes can share
predictable synchronous reactivity without importing framework lifecycles or
growing a broader state-management surface.

## Key capabilities

- Exports a tiny public API: `signal`, `computed`, and `effect`
- Uses predictable synchronous semantics with explicit `.value` access
- Tracks dependencies automatically during reads
- Computes derived state lazily and caches until invalidated
- Re-runs effects when dependencies change and supports disposal cleanup
- Stays framework-agnostic, tree-shakeable, and portable across runtimes

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

Effects can register cleanup for subscriptions, timers, or other disposable
work tied to the latest run:

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
- `computed<T>(fn)` for lazily derived reactive values
- `effect(fn)` for reactive side effects with disposal
- Internal dependency tracking and subscriber management
- Cleanup execution before effect re-runs and on stop
- Small, explicit, TypeScript-first reactive primitives for local UI state

Golden rule: keep this package at the primitive reactivity layer.

## What this package does not own

- Global store architecture or app-wide state containers
- Flux, Redux, Zustand, MobX, or RxJS-style patterns
- Framework bindings for React, Vue, Solid, Astro, or any other renderer
- Routing, page lifecycle orchestration, or navigation state
- Server state, fetching, caching, mutations, or persistence
- Devtools, time travel, inspectors, or debugging overlays
- Business-domain models, app containers, or dependency injection systems

If a proposed feature is not directly required to support
`signal`/`computed`/`effect`/disposal semantics, it does not belong here.

## Package exports / API surface

`@phcdevworks/spectre-shell-signals` exports:

- `signal`
- `computed`
- `effect`

It also exports the related TypeScript types:

- `Signal<T>`
- `Computed<T>`
- `EffectCallback`
- `EffectCleanup`
- `StopEffect`

Semantics:

- `signal(initialValue)` returns an object with a `.value` getter and setter
- `computed(fn)` is lazy, cached, and only recomputes after invalidation when
  read again
- `effect(fn)` runs immediately, tracks dependencies, and returns a stop
  function
- Effect callbacks receive an `onCleanup` registrar used to dispose work from
  the previous run
- Signal writes use `Object.is` to avoid no-op notifications for unchanged
  values

## Relationship to the rest of Spectre

Spectre keeps responsibilities narrow:

- [`@phcdevworks/spectre-tokens`](https://github.com/phcdevworks/spectre-tokens)
  defines design tokens and semantic contracts
- [`@phcdevworks/spectre-ui`](https://github.com/phcdevworks/spectre-ui)
  turns those contracts into reusable CSS, Tailwind helpers, and class recipes
- `@phcdevworks/spectre-shell-signals` provides framework-agnostic reactive
  primitives for local state and derived state
- Downstream shells and adapters compose these packages instead of asking one
  package to own every concern

That separation prevents architectural drift and keeps each package stable
enough to depend on directly.

## Development

Install dependencies, then run the package checks:

```bash
npm run build
npm test
```

Key source areas:

- `src/signal.ts` for writable signals
- `src/computed.ts` for lazy derived values
- `src/effect.ts` for effect execution and disposal
- `src/internals/graph.ts` for dependency tracking internals
- `tests/` for semantic and regression coverage

## Contributing

PHCDevworks maintains this package as part of the Spectre suite.

When contributing:

- keep the public API tiny
- prefer explicit behavior over convenience magic
- do not turn this package into a general store library
- do not add framework adapters or lifecycle integrations here
- add tests before changing reactive semantics
- run `npm run build` and `npm test` before opening a pull request

Scope discipline is part of the package contract.

## License

MIT © PHCDevworks. See [LICENSE](LICENSE).
