# @phcdevworks/spectre-shell-signals

`@phcdevworks/spectre-shell-signals` is the communication layer of the
Spectre application shell. It provides shared reactive signals for coordinating
state and events across independently developed modules.

Maintained by [PHCDevworks](https://go.phcdev.co). It is the reactive
primitive foundation for the Spectre stack, integrated by `spectre-tokens`,
`spectre-ui`, and `spectre-ui-astro` in `project-design`, and by
`spectre-shell` at the app-shell layer.

## Repository Snapshot

| Field                  | Value                                |
| ---------------------- | ------------------------------------ |
| Project team           | `project-shell`                      |
| Repository role        | Spectre reactive primitives          |
| Package/artifact       | `@phcdevworks/spectre-shell-signals` |
| Current version/status | 1.6.0                                |

## Standard Workflow

1. Read [AGENTS.md](AGENTS.md), then the agent-specific guide for the task.
2. Check [TODO.md](TODO.md) and [ROADMAP.md](ROADMAP.md) for current scope.
3. Make the smallest repo-local change that satisfies the task.
4. Run `npm run check` when validation is required or practical.
5. Update docs and [CHANGELOG.md](CHANGELOG.md) only when behavior, public
   contracts, or release-relevant metadata changed.

## Documentation Map

| Guide       | Path                         |
| ----------- | ---------------------------- |
| Agent rules | [AGENTS.md](AGENTS.md)       |
| Claude Code | [CLAUDE.md](CLAUDE.md)       |
| Codex       | [CODEX.md](CODEX.md)         |
| Copilot     | [COPILOT.md](COPILOT.md)     |
| Jules       | [JULES.md](JULES.md)         |
| Grok        | [GROK.md](GROK.md)           |
| Roadmap     | [ROADMAP.md](ROADMAP.md)     |
| Todo        | [TODO.md](TODO.md)           |
| Changelog   | [CHANGELOG.md](CHANGELOG.md) |
| Security    | [SECURITY.md](SECURITY.md)   |

[![npm version](https://img.shields.io/npm/v/@phcdevworks/spectre-shell-signals.svg)](https://www.npmjs.com/package/@phcdevworks/spectre-shell-signals)
[![CI](https://img.shields.io/github/actions/workflow/status/phcdevworks/spectre-shell-signals/ci.yml?branch=main&label=CI)](https://github.com/phcdevworks/spectre-shell-signals/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-shell-signals)](LICENSE)
[![Node](https://img.shields.io/node/v/@phcdevworks/spectre-shell-signals)](https://nodejs.org)

Small reactive primitives for Spectre packages. The package provides `signal`,
`computed`, `effect`, `asyncEffect`, `batch`, and `untracked` without tying Spectre runtime
code to a UI framework.

Part of the [PHCDevworks Spectre shell ecosystem](https://github.com/phcdevworks) — composable, zero-dependency packages for client-side shell applications.

[Contributing](CONTRIBUTING.md) | [Changelog](CHANGELOG.md) |
[Roadmap](ROADMAP.md) | [Security Policy](SECURITY.md)

## When To Use This Package

- You need synchronous reactive primitives (`signal`, `computed`, `effect`) without a full state management framework.
- You want typed, lazily-evaluated derived values with explicit disposal.
- You are building on top of a Spectre shell or want framework-agnostic reactive state in vanilla TypeScript.

## When Not To Use This Package

- You need a global store, atoms, selectors, or a full async resource/query layer (loading/error/caching state, request deduplication).
- You need framework-specific hooks such as `useSignal` for React or Vue.
- You need persistence, devtools, observables, event buses, or middleware.
- You need cross-component state coordination patterns beyond sharing signal instances.

## Capabilities

- Mutable signals through a `.value` getter and setter, and a `.peek()` method for untracked reads.
- Lazily evaluated computed values with dependency tracking and their own `.peek()`.
- `untracked(fn)` for reading reactive values without subscribing.
- Optional custom equality for signals and computeds.
- Glitch-free propagation: effects never observe a mix of fresh and stale
  values, and a computed that recomputes to an equal (`Object.is`) value does
  not re-run its dependents.
- Synchronous effects with cleanup registration.
- Cancelable async effects with synchronous dependency tracking.
- Batched subscriber notification across multiple signal writes.
- Automatic release of computed subscriptions once nothing observes them;
  explicit `stop()` for effects, and `Symbol.dispose` support for `using`.
- A deliberately small public API for shared Spectre runtime state.

## Installation

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
```

## API

- `signal(initialValue, options?)` returns a mutable signal with `.value` (tracked read/write) and `.peek()` (untracked read). Pass `{ equals }` to replace the default `Object.is` check that skips unchanged writes.
- `computed(fn, options?)` returns a cached, read-only derived value with `.value` (tracked read) and `.peek()` (untracked read). Pass `{ equals }` to replace the default `Object.is` check that stops propagation when a recompute produces an equal value. It subscribes to its sources only while an effect or another observed computed reads it, so no manual disposal is required; `dispose()` remains available to release subscriptions early. Writing a signal inside `fn` throws.
- `effect(fn, options?)` runs immediately, reruns when tracked dependencies change, and returns a stop function. Pass `{ onError }` to handle errors without stopping the effect.
- `batch(fn)` defers subscriber notification until `fn` returns, so effects run once per batch rather than once per write.
- `untracked(fn)` runs `fn` and returns its result without registering any reads as dependencies of the surrounding effect or computed. Writing a signal inside a computed still throws, even within `untracked`.
- `asyncEffect(fn, options?)` runs immediately, reruns when tracked dependencies change, and returns a stop function. Dependencies must be read synchronously, before the first `await`. Each run gets a fresh `AbortSignal`, aborted when the effect re-runs or stops. Pass `{ onError }` to handle errors without stopping the effect.
- Types include `Signal`, `ReadonlySignal`, `SignalOptions`, `Computed`, `ComputedOptions`, `EffectCallback`, `EffectCleanup`, `EffectOptions`, `CleanupRegistrar`, `StopEffect`, `AsyncEffectCallback`, `AsyncEffectContext`, and `AsyncEffectOptions`.

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

### `untracked()`

`untracked` is `peek()` for a whole block: reads of signals, computeds, and
helper functions inside it do not subscribe the surrounding observer.

```ts
const user = signal({ name: 'Ada' })
const locale = signal('en')

effect(() => {
  // re-runs when `user` changes, but NOT when `locale` changes
  const name = user.value.name
  console.log(untracked(() => format(name, locale.value)))
})
```

### Custom equality

By default, a write that is `Object.is`-equal to the current value is ignored,
and a computed that recomputes to an `Object.is`-equal value does not re-run its
dependents. Pass `equals` to define "unchanged" for structured values. A write
reported as equal is skipped entirely and the previous value is kept.

```ts
const items = signal([1, 2, 3])
const evens = computed(() => items.value.filter((n) => n % 2 === 0), {
  equals: (previous, next) =>
    previous.length === next.length && previous.every((n, i) => n === next[i]),
})

items.value = [1, 2, 5] // evens is still [2]; its dependents do not re-run
```

### `ReadonlySignal`

`ReadonlySignal<T>` is a type-only read view (`.value` and `.peek()`) that both
`Signal<T>` and `Computed<T>` satisfy. Use it to expose state from a module
without letting callers write to it.

```ts
const count = signal(0)
export const currentCount: ReadonlySignal<number> = count
```

### Disposal with `using`

Effect stop handles and computeds implement `Symbol.dispose`, so they can be
scoped with `using`:

```ts
{
  using stop = effect(() => console.log(count.value))
  count.value = 1
} // effect stopped here
```

Calling `stop()` or `dispose()` directly still works. `Symbol.dispose` is
attached only on runtimes that define it (Node 22+, current browsers, or a
polyfill); the types require TypeScript 5.2+ with the `esnext.disposable` lib or
`@types/node`.

### Effect error boundary

Pass `onError` to handle errors thrown inside an effect without stopping the reactive chain. The effect stays active and re-runs normally when its next dependency changes.

```ts
const count = signal(0)

const stop = effect(
  () => {
    if (count.value === 1) throw new Error('bad state')
    console.log(count.value)
  },
  { onError: (err) => console.error('effect error:', err) }
)

count.value = 1 // onError fires, effect stays alive
count.value = 2 // logs 2 normally
stop()
```

Cleanup callbacks run in reverse registration order, including when one throws.
The first cleanup error is reported through `onError`, or thrown if no handler is
provided. A failed cleanup skips that re-run's body; the effect can run again on
the next dependency change. Stopping still disposes the effect if cleanup fails.

When a batched effect throws, the remaining queued effects still run before the
first error is rethrown.

Without `onError`, errors propagate synchronously to the caller — the initial run throws from `effect()`, and re-run errors throw from the signal setter.

### `asyncEffect()`

`asyncEffect` is for effect bodies that need to perform async work (e.g. a
`fetch` call) while still participating in the reactive graph. Only the
synchronous portion of the callback — before the first `await` — is tracked;
reads after an `await` belong to a resumed continuation and are not tracked,
so read every dependency you need before awaiting anything.

```ts
const id = signal(1)

const stop = asyncEffect(async ({ signal: abortSignal, onCleanup }) => {
  const currentId = id.value // tracked: read before the first await
  const response = await fetch(`/api/items/${currentId}`, { signal: abortSignal })
  if (abortSignal.aborted) return
  const item = await response.json()
  console.log(item)
})

id.value = 2 // aborts the in-flight request, re-runs with currentId = 2
stop() // aborts the active request and runs cleanup
```

Cleanup registered after an async run has been stopped or replaced executes
immediately. Cleanup belongs to the run that registered it, even when registered
after an `await`.

Each run receives a fresh `AbortSignal` that is aborted when the effect
re-runs or is stopped — pass it to `fetch` or any cancelable API so stale
work does not race a newer run. Rejections from a run whose signal has since
been aborted are swallowed rather than reported to `onError`, since they
belong to a superseded run.

## Ecosystem

`spectre-shell-signals` is the reactive primitive foundation for the Spectre stack:

| Package                 | Role                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `spectre-shell-signals` | Reactive primitives (`signal`, `computed`, `effect`)              |
| `spectre-tokens`        | Visual language and token contracts (reactive token values)       |
| `spectre-ui`            | Token-driven styling and class recipes (reactive component state) |
| `spectre-ui-astro`      | Astro component layer (island lifecycle integration)              |

Consuming packages depend on this package for reactive state. They do not re-export
its primitives or extend its API.

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
- `npm run bench` builds the package and runs the propagation benchmarks against `dist`.
- `npm run build` emits ESM, CJS, and declarations to `dist`.
- `npm run check:version-sync` confirms the README "Current version/status" row matches `package.json`.
- `npm run check:ecosystem` validates `spectre.manifest.json` against the ecosystem contract.
- `npm run check` runs the standard package verification flow.

AI-agent coordination starts in [AGENTS.md](./AGENTS.md), with companion
guidance in [CLAUDE.md](./CLAUDE.md), [CODEX.md](./CODEX.md),
[COPILOT.md](./COPILOT.md), [JULES.md](./JULES.md), [GROK.md](./GROK.md), and
[.github/copilot-instructions.md](./.github/copilot-instructions.md).

### Troubleshooting

| Problem                            | Likely cause                              | Fix                                                 |
| ---------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `npm run check` fails on typecheck | Type error in source or tests             | Run `npm run typecheck` to isolate                  |
| `dist/` is missing after clone     | Build output is gitignored                | Run `npm run build`                                 |
| Tests fail in CI but pass locally  | Node version mismatch                     | CI runs Node 22 and 24; match locally               |
| Effect runs more than expected     | Unintended `.value` read in tracked scope | Move non-reactive reads outside the effect callback |

## AI And Automation Boundaries

Claude Code (`claude-sonnet-4-6`) is the primary development agent for this
repository. Codex handles releases, including cutting tagged releases and
GitHub Releases, and production stabilization. Jules handles small automated
fixes and dependency updates. GitHub Copilot provides development support.

All AI agents with repository access (Claude Code, Codex, Copilot, Jules)
have commit, push, and tag authority in this repository. Publishing to npm
remains Bradley Potts's sole authority. See [AGENTS.md](AGENTS.md) for the
full commit-policy and release-authority grant.

**Protected from automated change:** the reactive-primitives-only scope (no
DOM rendering, routing, lifecycle orchestration, async scheduling, stores,
persistence, or framework adapters added locally). See
[AGENTS.md](AGENTS.md) for full agent governance and boundary rules.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The gate is `npm run check` — typecheck, lint, build, test, README version-sync, and ecosystem validation must all pass. Do not expand the reactive-primitives scope; see [AGENTS.md](./AGENTS.md) for boundaries.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
