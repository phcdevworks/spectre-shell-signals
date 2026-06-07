# Integration Assessment: spectre-ui-astro

**Status:** Assessed  
**Date:** 2026-06-07  
**Scope:** `@phcdevworks/spectre-shell-signals` ↔ `spectre-ui-astro`

## Question

How should `signal`/`computed`/`effect` initialize and tear down within an
Astro island lifecycle, and does `effect` cleanup work correctly on component
unmount?

## What spectre-ui-astro Actually Ships Today

`spectre-ui-astro` is a set of `.astro` components (`SpButton`, `SpCard`,
`SpInput`, etc. — `src/components/*.astro`) that are **pure server-rendered
markup**: each component reads `Astro.props`, calls a `spectre-ui` recipe
function (e.g. `getButtonClasses`) to produce a class string, and renders a tag
with that class and resolved attributes (`src/components/SpButton.astro`).

There is **no client-side JavaScript anywhere in this package** — no
`<script>` blocks, no `client:*` hydration directives, no custom elements, no
framework islands (confirmed by searching `src/` for those patterns; zero
matches). Every component is fully static once rendered; interactive states
like `hovered`/`active`/`focused` are passed in as **props** rather than
tracked at runtime.

## Conclusion: The Integration Point Doesn't Exist Yet

Because there is no client-side runtime in `spectre-ui-astro`, there is
currently **no Astro island lifecycle for `signal`/`computed`/`effect` to plug
into** — there is nothing to initialize or tear down. The question this TODO
item asks is forward-looking: it anticipates a future where some component
gains client-side interactivity (e.g. a tag input, a dismissible alert, a
disclosure/accordion) via an Astro island.

## Pattern to Apply When Islands Are Introduced

When a component needs client-side state, Astro's model is: render static
markup at build/request time, then hydrate a `<script>` (inline, or a custom
element) on the client per the chosen `client:*` directive. The
`signal`/`computed`/`effect` lifecycle maps onto that hydration boundary
directly:

```astro
---
// SpDismissibleAlert.astro — server-rendered markup, props only.
import { getAlertClasses } from '@phcdevworks/spectre-ui'
const { variant, id } = Astro.props
---
<div class={getAlertClasses({ variant })} data-sp-alert id={id}>
  <slot />
  <button data-sp-alert-dismiss aria-label="Dismiss">×</button>
</div>

<script>
  import { signal, effect } from '@phcdevworks/spectre-shell-signals'

  // Runs once per hydrated instance — this *is* the island's "mount".
  document.querySelectorAll<HTMLElement>('[data-sp-alert]').forEach((el) => {
    const dismissed = signal(false)
    const button = el.querySelector('[data-sp-alert-dismiss]')

    const stop = effect(() => {
      el.hidden = dismissed.value
    })

    button?.addEventListener('click', () => { dismissed.value = true })

    // "Unmount": Astro islands don't emit a teardown event for plain <script>
    // blocks, but view-transition / persistence scenarios do. Listen for the
    // page lifecycle event the island actually participates in and call
    // `stop()` there so subscriptions don't leak across navigations.
    document.addEventListener('astro:before-swap', stop, { once: true })
  })
</script>
```

Guidelines that follow from this:

- **`signal`/`computed`/`effect` instances are created at hydration, not at
  module load.** Each hydrated island gets its own signals — do not hoist
  shared signal instances to module scope unless the state is genuinely
  cross-island (e.g. the `activeMode` signal from the
  [spectre-tokens pattern](spectre-tokens.md), which is page-global by design).
- **`effect`'s `StopEffect` return is the teardown hook.** Capture it and call
  it explicitly on whatever lifecycle event corresponds to the island going
  away. Astro's View Transitions API emits `astro:before-swap` /
  `astro:after-swap` on `document`; for islands rendered via a framework
  renderer (`client:*` with React/Vue/Svelte/etc.), use that framework's own
  unmount hook to call `stop()`. Plain `<script>` islands with no transitions
  enabled don't get a teardown signal at all — in that case `effect` cleanup
  only matters for *re-runs* (dependency changes), not disposal, and that
  already works per the existing test suite.
- **Confirm `effect` cleanup is unaffected by being inside a `<script>`
  module.** Nothing about Astro's script execution model changes how `effect`
  schedules re-runs or cleanup — it is plain synchronous DOM JavaScript. The
  existing cleanup-before-rerun and cleanup-on-disposal guarantees
  (`tests/signals.test.ts`) apply unchanged; no adapter code is needed in
  `spectre-shell-signals`.

## Conclusion

No changes are required in `spectre-shell-signals` to support
`spectre-ui-astro` — and none can usefully be made yet, because the package has
no client-side runtime to integrate with. The pattern above (create signals at
hydration time, derive with `computed`, apply via `effect`, capture and invoke
`StopEffect` on the relevant Astro lifecycle event) should be recorded in the
Phase 3 P2 integration guide as the reference design for the first interactive
island `spectre-ui-astro` ships, alongside the
[spectre-tokens](spectre-tokens.md) and [spectre-ui](spectre-ui.md) patterns.
