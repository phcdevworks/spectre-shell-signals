# Versioning Policy

**Scope:** `@phcdevworks/spectre-shell-signals`

This package follows [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`.

## What Counts as Breaking (MAJOR)

A change requires a major version bump if it can change the observable behavior
or type signature of any export listed in the [Public API](../README.md):
`signal`, `computed`, `effect`, `batch`, and their exported types (`Signal`,
`Computed`, `EffectCallback`, `EffectCleanup`, `EffectOptions`,
`CleanupRegistrar`, `StopEffect`).

Examples:

- Removing or renaming an export.
- Changing a function signature (parameters, return type, generic constraints).
- Changing reactive semantics — when subscribers are notified, when computed
  values recompute, cleanup ordering, disposal behavior, batching guarantees.
- Raising the minimum supported Node.js or TypeScript version.
- Changing the package's module format in a way that breaks existing consumers
  (ESM/CJS export map changes).

## What Counts as Feature (MINOR)

- Adding a new export that extends the primitive surface without changing
  existing behavior (subject to the export criteria in `CLAUDE.md` — primitive
  reactivity only, required now, not store- or framework-shaped).
- Adding optional fields to existing option types (e.g. `EffectOptions`) that
  default to current behavior when omitted.

## What Counts as Fix (PATCH)

- Bug fixes that restore documented behavior without changing the public
  contract.
- Internal refactors, performance improvements, dependency bumps, and tooling
  changes that do not alter observable behavior.
- Documentation and metadata corrections.

## Downstream Coordination

Because this package sits at the base of the Spectre stack (see
`spectre.manifest.json` for declared consumers), any proposed MAJOR change must:

1. Be recorded in `CHANGELOG.md` under `[Unreleased]` with a clear description
   of the breaking behavior and a migration note.
2. Be flagged to downstream package owners (`spectre-tokens`, `spectre-ui`,
   `spectre-ui-astro`, and any other declared consumer) before the release is
   tagged, so they can assess impact and plan their own upgrades.
3. Wait for at least one downstream consumer to confirm compatibility (or
   document the required follow-up change) before the major version is
   published.

MINOR and PATCH releases do not require downstream sign-off, but should still
be reflected in `CHANGELOG.md` so consumers can audit what changed.

## Process

1. Land changes with `[Unreleased]` changelog entries describing user-visible
   impact and classifying it as breaking, feature, or fix.
2. Run `npm run release:propose` to get an advisory semver bump suggestion
   based on the `[Unreleased]` section.
3. Bradley Potts has final version authority — the proposal is advisory, not
   binding.
4. `npm run check` (the full validation gate) must pass before any version is
   tagged or published.
