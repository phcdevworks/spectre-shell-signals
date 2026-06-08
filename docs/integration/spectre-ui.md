# Integration Assessment: spectre-ui

**Status:** Assessed  
**Date:** 2026-06-07  
**Scope:** `@phcdevworks/spectre-shell-signals` ↔ `spectre-ui`

## Question

What is the pattern for consuming a signal inside a UI component built on
`spectre-ui` — a direct `.value` read in an effect, or computed class/style
state?

## What spectre-ui Actually Ships

`spectre-ui` is a Layer 2 _styling contract_: a set of pure "recipe" functions
(`getButtonClasses`, `getCardClasses`, `getBadgeClasses`, etc. — see
`src/recipes/*.ts`) that take a plain options object and return a class-name
string, plus static CSS bundles and a Tailwind preset/theme. There are no
components, no DOM access, and no state — every recipe is `(opts) => string`,
deterministic and side-effect free (`src/recipes/button.ts:38`).

This means `spectre-ui` itself has nothing to integrate with `signal` —
it is pure derivation logic at the bottom of the styling stack, exactly the
shape a `computed` wants to wrap.

## Integration Pattern

The reactive state lives in the _consuming component_ (e.g. an Astro island, a
framework adapter, or hand-written interactive markup), not in `spectre-ui`.
The pattern is: **hold interaction state in signals, derive the class string
with `computed`, and apply it to the DOM in `effect`.**

```ts
import { signal, computed, effect } from '@phcdevworks/spectre-shell-signals'
import { getButtonClasses, type ButtonRecipeOptions } from '@phcdevworks/spectre-ui'

// 1. Reactive state: the things that actually change at runtime.
const hovered = signal(false)
const active = signal(false)
const loading = signal(false)

// 2. Computed: derive the recipe options and resulting class string.
//    getButtonClasses is pure, so wrapping it in `computed` gives a cached,
//    automatically-invalidated class string — recompute only when an input changes.
const buttonClasses = computed(() =>
  getButtonClasses({
    variant: 'primary',
    hovered: hovered.value,
    active: active.value,
    loading: loading.value,
  } satisfies ButtonRecipeOptions)
)

// 3. Effect: the only place that touches the DOM.
effect(() => {
  buttonEl.className = buttonClasses.value
})

buttonEl.addEventListener('pointerenter', () => {
  hovered.value = true
})
buttonEl.addEventListener('pointerleave', () => {
  hovered.value = false
})
```

Guidelines that follow from this:

- **Prefer `computed` over a direct `.value` read inside `effect`.** Recipe
  functions are pure and potentially called from multiple places (e.g. a class
  string and an ARIA attribute both depend on `loading`); `computed` caches the
  derivation and shares it. Reading signals directly in an `effect` and
  recomputing the class string inline duplicates work and couples DOM-writing
  to derivation.
- **`effect` is strictly the DOM-application boundary.** Setting
  `className`, `style`, `aria-*` attributes, or toggling classes belongs in
  `effect` — never inside a recipe call or a `computed`.
- **Keep recipe options minimal and explicit.** Only pass the options whose
  underlying signals genuinely vary at runtime (`hovered`, `active`, `loading`
  in the example). Static structural choices (`variant`, `size`) can stay plain
  values unless the component itself makes them switchable.
- **No adapter needed in `spectre-shell-signals`.** Because recipes are pure
  `(opts) => string` functions, `computed` already composes with them with zero
  glue code. Nothing about `spectre-ui`'s shape requires new exports or helpers
  here — confirms the non-goal of DOM-binding helpers in `CLAUDE.md`.

## Conclusion

No changes are required in `spectre-shell-signals` to support `spectre-ui`.
`spectre-ui`'s pure recipe functions are an ideal fit for `computed`: wrap
recipe calls in `computed` keyed on the signals that represent real interaction
state, and apply the resulting class string to the DOM from `effect`. This
pattern should be carried into the Phase 3 P2 integration guide alongside the
[spectre-tokens pattern](spectre-tokens.md).
