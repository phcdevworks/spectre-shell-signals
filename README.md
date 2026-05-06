# @phcdevworks/spectre-shell-signals

Small synchronous reactive primitives for Spectre packages. The package provides `signal`, `computed`, and `effect` without tying Spectre runtime code to a UI framework.

[Issues](https://github.com/phcdevworks/spectre-shell-signals/issues) | [Pull requests](https://github.com/phcdevworks/spectre-shell-signals/pulls) | [Security](./SECURITY.md) | [Contributing](./CONTRIBUTING.md)

## Capabilities

- Mutable signals through a `.value` getter and setter.
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

- `signal(initialValue)` returns a mutable signal.
- `computed(fn)` returns a cached computed value with `dispose()`.
- `effect(fn)` runs immediately, reruns when tracked dependencies change, and returns a stop function.
- Types include `Signal`, `Computed`, `EffectCallback`, `EffectCleanup`, `CleanupRegistrar`, and `StopEffect`.

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

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
