# Integration Guide: Consuming `@phcdevworks/spectre-shell-signals`

**Status:** Active reference  
**Date:** 2026-06-08  
**Scope:** install, shared instances, `computed`/`effect` in a component context,
cleanup patterns, Astro island hydration

This guide collects the patterns established while assessing
[spectre-tokens](spectre-tokens.md), [spectre-ui](spectre-ui.md), and
[spectre-ui-astro](spectre-ui-astro.md) into one reference for any package that
consumes signals.

## Install

```bash
npm install @phcdevworks/spectre-shell-signals
```

The package ships dual ESM/CJS builds with bundled types — `import` and
`require` both resolve correctly, no extra configuration needed. See
[versioning-policy.md](../versioning-policy.md) for semver and upgrade
expectations.

## The Core Rule: State → Derivation → Effect

Every integration in the Spectre stack follows the same three-layer shape:

```ts
import { signal, computed, effect } from '@phcdevworks/spectre-shell-signals'

const state = signal(/* the thing that actually changes */)
const derived = computed(() => /* pure transformation of state.value */)
effect(() => {
  /* apply derived.value to the DOM — the only place side effects happen */
})
```

- **`signal` holds _state that changes at runtime_** — interaction state,
  active mode, user selection. Static data (token objects, recipe functions)
  stays a plain import; wrapping it in a signal adds tracking overhead for
  values that never change.
- **`computed` holds _pure derivation_** — resolving mode-dependent tokens,
  building a class string from a recipe, combining multiple signals. It caches
  and only recomputes when an input actually changes.
- **`effect` is the _only_ place side effects happen** — DOM writes
  (`className`, `style`, `setProperty`, attribute toggles), event listener
  registration tied to reactive state, anything that reaches outside the
  reactive graph.

Concrete walkthroughs of this shape:

- [spectre-tokens](spectre-tokens.md) — `activeMode` signal → `computed`
  CSS-variable map → `effect` writing custom properties to `:root`
- [spectre-ui](spectre-ui.md) — interaction signals (`hovered`, `active`,
  `loading`) → `computed` recipe class string → `effect` setting `className`

## Shared Signal Instances

Most signals belong to a single component instance and should be created where
that instance is created (see "Astro Island Hydration" below). The exception is
**genuinely page-global state** — state that more than one independent
component needs to read and react to, such as the active color mode from
[spectre-tokens](spectre-tokens.md):

```ts
// mode.ts — module-scope export, intentionally shared across the page
export const activeMode = signal<SpectreModeName>('default')
```

Hoist a signal to module scope only when the underlying state is genuinely
shared. Hoisting per-instance interaction state (e.g. `hovered`) would leak it
across every consumer of that module — keep those scoped to where the
component instance is created.

## `computed` and `effect` in a Component Context

Wrap pure derivations — recipe calls, mode resolution, combining multiple
signals into one value — in `computed`, not inline inside `effect`. This keeps
the cached, automatically-invalidated value shareable across multiple
consumers (e.g. a class string and an `aria-busy` attribute that both depend on
`loading`):

```ts
const buttonClasses = computed(() =>
  getButtonClasses({ variant: 'primary', hovered: hovered.value, loading: loading.value })
)

effect(() => {
  buttonEl.className = buttonClasses.value
  buttonEl.setAttribute('aria-busy', String(loading.value))
})
```

Reserve `effect` strictly for the DOM-application boundary. Reading a signal
directly inside `effect` and recomputing a derived value inline duplicates work
across every effect that needs it — `computed` exists so that work happens once.

## Cleanup Patterns

`effect()` returns a `StopEffect` — call it to dispose the effect and run any
pending cleanup. **Always capture and invoke it** when the owning component
instance goes away:

```ts
const stop = effect(() => {
  el.hidden = dismissed.value
})

// later, when the instance is torn down:
stop()
```

What "torn down" means depends on the host environment:

- **Framework-rendered islands** (`client:*` with React/Vue/Svelte/etc.) — call
  `stop()` from that framework's unmount hook.
- **Plain `<script>` islands with View Transitions enabled** — listen for
  `astro:before-swap` on `document` and call `stop()` there (see the full
  example in [spectre-ui-astro](spectre-ui-astro.md)).
- **Plain `<script>` islands with no transitions** — there is no teardown
  signal at all; `effect` cleanup only matters for _re-runs_ between dependency
  changes, not disposal, and that already works per the existing test suite.

## Astro-Specific Notes: Island Hydration and Teardown

`spectre-ui-astro` components are server-rendered markup with no client-side
runtime today (see the full assessment in
[spectre-ui-astro](spectre-ui-astro.md)). When a component gains interactivity,
the `signal`/`computed`/`effect` lifecycle maps onto Astro's hydration model
directly:

- **Create signals at hydration time, not at module load.** Each hydrated
  island instance gets its own `signal`/`computed`/`effect` set:

  ```astro
  <script>
    import { signal, effect } from '@phcdevworks/spectre-shell-signals'

    document.querySelectorAll<HTMLElement>('[data-sp-alert]').forEach((el) => {
      const dismissed = signal(false)
      const stop = effect(() => { el.hidden = dismissed.value })

      el.querySelector('[data-sp-alert-dismiss]')
        ?.addEventListener('click', () => { dismissed.value = true })

      document.addEventListener('astro:before-swap', stop, { once: true })
    })
  </script>
  ```

- **Don't hoist per-instance state to module scope.** Module-scope signals are
  shared across every hydrated instance on the page — appropriate only for
  genuinely page-global state like `activeMode` (see "Shared Signal Instances"
  above), not per-component interaction state like `dismissed`.
- **Astro's script execution is plain synchronous DOM JavaScript.** Nothing
  about running inside a `<script>` block changes how `effect` schedules
  re-runs or cleanup — the existing guarantees in `tests/signals.test.ts` apply
  unchanged. No adapter code is needed in `spectre-shell-signals`.

## Summary

| Layer      | Holds                               | Recomputes when                                            |
| ---------- | ----------------------------------- | ---------------------------------------------------------- |
| `signal`   | state that changes at runtime       | written to directly                                        |
| `computed` | pure derivation of signals/computed | a dependency's value changes                               |
| `effect`   | side effects (DOM, listeners)       | a dependency's value changes, runs immediately on creation |

State flows down through derivation into effects; cleanup flows back up through
captured `StopEffect` functions invoked at the boundary where the owning
instance is torn down. This is the entire integration surface — no adapters,
stores, or framework-specific glue are needed anywhere in the Spectre stack.
