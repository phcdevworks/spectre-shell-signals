# Integration Assessment: spectre-tokens

**Status:** Assessed  
**Date:** 2026-06-07  
**Scope:** `@phcdevworks/spectre-shell-signals` ↔ `spectre-tokens`

## Question

Which values in `spectre-tokens` are static vs. reactive, and what is the
pattern for wiring any reactive token state through `signal`/`computed`/`effect`?

## What spectre-tokens Actually Ships

`spectre-tokens` generates a single static `SpectreTokens` object from JSON
source files (`tokens/*.json` → `src/generated/tokens.ts`) at build time:
color scales, typography, spacing, radii, shadows, breakpoints, transitions,
component tokens, and a Tailwind theme/preset derived from them
(`src/index.ts`, `createTailwindTheme`). `generateCssVariables` (`src/css.ts`)
turns that object into a CSS custom-property map.

**Nearly everything here is static.** The token values themselves do not change
at runtime — they are compile-time constants resolved once per build. There is
nothing in this package that reads or writes a `signal`, and there should not
be: token _values_ are data, not reactive state.

## The One Runtime-Variable Concept: Mode

The package exposes `SpectreModeName = 'default' | 'dark'` and
`SpectreModeTokens` (`src/types.ts:144-176`) — a mode-keyed set of semantic
surface/text/component values (see `tokens/modes.json`). This is the only
place where "which token values are in effect" can change after the page has
loaded: a user or system can switch between `default` and `dark` (and
potentially future modes) at runtime.

That makes **the active mode** the sole candidate for reactive state in a
token-consuming application — not the tokens themselves.

## Integration Pattern

Consuming packages (e.g. `spectre-ui`, `spectre-ui-astro`) should hold the
active mode in a signal and derive everything else with `computed`:

```ts
import { signal, computed, effect } from '@phcdevworks/spectre-shell-signals'
import { tokens, generateCssVariables, type SpectreModeName } from '@phcdevworks/spectre-tokens'

// 1. Reactive state: which mode is active. Initialize from system preference,
//    persisted user choice, etc. — that's the consumer's responsibility.
export const activeMode = signal<SpectreModeName>('default')

// 2. Derived, cached values: resolve mode-dependent token data lazily.
const modeTokens = computed(() => tokens.modes[activeMode.value])

const cssVariables = computed(() => generateCssVariables(tokens, { mode: activeMode.value }))

// 3. Side effects: apply derived values to the DOM, re-running on mode change.
effect(() => {
  const root = document.documentElement
  Object.entries(cssVariables.value).forEach(([name, value]) => {
    root.style.setProperty(name, value)
  })
})
```

Guidelines that follow from this:

- **Signals hold _selection_, not data.** `activeMode` is a signal because it
  changes; `tokens` stays a plain static import because it does not.
- **`computed` for derivation, not duplication.** Resolving mode-specific
  values or generating CSS variable maps belongs in `computed` so it is cached
  and only recomputes when `activeMode` actually changes.
- **`effect` only at the DOM boundary.** Writing CSS custom properties, toggling
  a `data-theme` attribute, or swapping a class on `:root` are side effects —
  they belong in `effect`, not in `computed`.
- **Do not wrap the whole token object in a signal.** It is static; doing so
  would add tracking overhead for values that never change and blur the line
  between data and state (a non-goal — see `CLAUDE.md` "Non-goals").

## Conclusion

No changes are required in `spectre-shell-signals` to support `spectre-tokens`.
The integration boundary is clean: `spectre-tokens` provides static data and a
`SpectreModeName` type; a consumer wires the _active mode_ through a `signal`
and derives mode-dependent values with `computed`, applying them via `effect`.
This pattern should be carried into the Phase 3 P2 integration guide.
