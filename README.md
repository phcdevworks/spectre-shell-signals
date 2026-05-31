# @phcdevworks/spectre-shell-signals

[![npm version](https://img.shields.io/npm/v/@phcdevworks/spectre-shell-signals.svg)](https://www.npmjs.com/package/@phcdevworks/spectre-shell-signals)
[![CI](https://img.shields.io/github/actions/workflow/status/phcdevworks/spectre-shell-signals/ci.yml?branch=main&label=CI)](https://github.com/phcdevworks/spectre-shell-signals/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-shell-signals)](LICENSE)
[![Node](https://img.shields.io/node/v/@phcdevworks/spectre-shell-signals)](https://nodejs.org)

Small synchronous reactive primitives for Spectre packages. The package provides `signal`, `computed`, and `effect` without tying Spectre runtime code to a UI framework.

Part of the [PHCDevworks Spectre shell ecosystem](https://github.com/phcdevworks) — composable, zero-dependency packages for client-side shell applications.

[Contributing](CONTRIBUTING.md) | [Changelog](CHANGELOG.md) |
[Roadmap](ROADMAP.md) | [Security Policy](SECURITY.md)

## When to use this package

- You need synchronous reactive primitives (`signal`, `computed`, `effect`) without a full state management framework.
- You want typed, lazily-evaluated derived values with explicit disposal.
- You are building on top of a Spectre shell or want framework-agnostic reactive state in vanilla TypeScript.

## When not to use this package

- You need a global store, atoms, selectors, or async resource primitives.
- You need framework-specific hooks such as `useSignal` for React or Vue.
- You need persistence, devtools, observables, event buses, or middleware.
- You need cross-component state coordination patterns beyond sharing signal instances.

## Capabilities

- Mutable signals through a `.value` getter and setter, and a `.peek()` method for untracked reads.
- Lazily evaluated computed values with dependency tracking.
- Synchronous effects with cleanup registration.
- Explicit disposal for computed values and effects.
- A deliberately small public API for shared Spectre runtime state.

## Install

```bash
npm install @phcdevworks/spectre-shell-signals
```

## Quick Start

```ts
import { computed, effect, signal } from '@phcdevworks/spectre-shell-signals'

const count = signal(0)
const doubled = computed(() => count.value * 2)

const stop = effect((onCleanup) => {
  console.log(`count=${count.value}; doubled=${doubled.value}`)
  onCleanup(() => console.log('effect cleanup'))
})

count.value = 2
stop()
doubled.dispose()
```

## API

- `signal(initialValue)` returns a mutable signal with `.value` (tracked read/write) and `.peek()` (untracked read).
- `computed(fn)` returns a cached computed value with `dispose()`.
- `effect(fn, options?)` runs immediately, reruns when tracked dependencies change, and returns a stop function. Pass `{ onError }` to handle errors without stopping the effect.
- `batch(fn)` defers subscriber notification until `fn` returns, so effects run once per batch rather than once per write.
- Types include `Signal`, `Computed`, `EffectCallback`, `EffectCleanup`, `EffectOptions`, `CleanupRegistrar`, and `StopEffect`.

### `signal.peek()`

`peek()` reads the current value without registering the caller as a subscriber. Use it inside an effect or computed body when you need the value but do not want to re-run the observer when it changes.

```ts
const count = signal(0)

effect(() => {
  // re-runs whenever `flag` changes, but NOT when `count` changes
  if (flag.value) {
    console.log(count.peek())
  }
})
```

### Effect error boundary

Pass `onError` to handle errors thrown inside an effect without stopping the reactive chain. The effect stays active and re-runs normally when its next dependency changes.

```ts
const count = signal(0)

const stop = effect(
  () => {
    if (count.value === 1) throw new Error('bad state')
    console.log(count.value)
  },
  { onError: (err) => console.error('effect error:', err) },
)

count.value = 1 // onError fires, effect stays alive
count.value = 2 // logs 2 normally
stop()
```

Without `onError`, errors propagate synchronously to the caller — the initial run throws from `effect()`, and re-run errors throw from the signal setter.

## Boundaries

This package owns only low-level reactive primitives. It does not own DOM rendering, routing, lifecycle orchestration, async scheduling, stores, persistence, or framework adapters.

## Development

```bash
npm install
npm run check
```

Useful scripts:

- `npm run typecheck` validates TypeScript without emitting files.
- `npm run lint` runs ESLint.
- `npm run test` runs the Vitest suite once.
- `npm run build` emits ESM, CJS, and declarations to `dist`.
- `npm run check` runs the standard package verification flow.

AI-agent coordination starts in [AGENTS.md](./AGENTS.md), with companion
guidance in [CLAUDE.md](./CLAUDE.md), [CODEX.md](./CODEX.md),
[COPILOT.md](./COPILOT.md), [JULES.md](./JULES.md), and
[.github/copilot-instructions.md](./.github/copilot-instructions.md).

### Troubleshooting

| Problem                            | Likely cause                              | Fix                                                 |
| ---------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `npm run check` fails on typecheck | Type error in source or tests             | Run `npm run typecheck` to isolate                  |
| `dist/` is missing after clone     | Build output is gitignored                | Run `npm run build`                                 |
| Tests fail in CI but pass locally  | Node version mismatch                     | CI runs Node 22 and 24; match locally               |
| Effect runs more than expected     | Unintended `.value` read in tracked scope | Move non-reactive reads outside the effect callback |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The gate is `npm run check` — all of typecheck, lint, build, and tests must pass. Do not expand the reactive-primitives scope; see [AGENTS.md](./AGENTS.md) for boundaries.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
