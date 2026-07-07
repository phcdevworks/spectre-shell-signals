# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning reflects package releases published to npm.

## [Unreleased]

### Added

- Added `docs/integration/spectre-tokens.md`, assessing which `spectre-tokens`
  values are static vs. reactive (only the active mode varies at runtime) and
  documenting the `signal`/`computed`/`effect` pattern for wiring mode-dependent
  token values into a consuming application.
- Added `docs/integration/spectre-ui.md`, documenting the pattern for wrapping
  `spectre-ui`'s pure recipe functions in `computed` and applying the resulting
  class strings to the DOM from `effect`.
- Added `docs/integration/spectre-ui-astro.md`, assessing the (currently
  nonexistent) Astro island lifecycle in `spectre-ui-astro` and recording the
  reference pattern for initializing signals at hydration and invoking
  `StopEffect` on teardown when the package ships its first interactive island.
- Added `docs/integration/guide.md`, the consuming-package integration guide:
  install, the state → derivation → effect pattern, shared signal instances,
  `computed`/`effect` usage in a component context, `StopEffect` cleanup
  patterns, and Astro-specific notes on island hydration and teardown. Ties
  together the patterns recorded in the `spectre-tokens`, `spectre-ui`, and
  `spectre-ui-astro` integration assessments.
- Added `docs/versioning-policy.md`, documenting how semver is applied to this
  package (what counts as breaking/feature/fix) and how downstream Spectre
  packages are coordinated on major releases. Linked from `CONTRIBUTING.md`.
- Added `@phcdevworks/spectre-manifest` as a devDependency. `spectre.manifest.json`
  at the repo root declares this package's ecosystem role, layer, exports, and
  allowed dependency targets. `check:ecosystem` validates it in the check pipeline.
- Added `scripts/check-readme-version.ts` and wired it into `npm run check` as
  `check:version-sync`, verifying the README "Current version/status" row
  matches `package.json`'s version on every check run.

## [1.1.0] - 2026-06-04

Release Title: Phase 2 - Reactive Ergonomics Release

### Added

- **`signal.peek()`**: Reads the current signal value without registering a dependency. Use inside effects or computed bodies when you need the value but do not want the observer to re-run when it changes.
- **`batch(fn)`**: Defers subscriber notification until `fn` returns so that effects in diamond-dependency graphs run once per batch instead of once per signal write. Nested `batch()` calls defer until the outermost batch ends.
- **`EffectOptions.onError`**: Optional error handler for `effect(fn, { onError })`. When provided, errors thrown inside the effect callback are passed to `onError` instead of propagating. The effect stays active and re-runs on the next dependency change. Default behavior (no `onError`) continues to throw synchronously.

### Changed

- **Computed stability audit**: Confirmed and tested that no-op signal writes (`signal.value = signal.value`) do not re-derive downstream computed values or re-run downstream effects anywhere in the invalidation path.

## [1.0.0] - 2026-04-25

Release Title: Phase 1 - Stable Reactive Primitives Release

### Added

- **Computed Disposal**: Added `computed.dispose()` so computed values can explicitly release tracked dependencies when they are no longer needed.
- **Public Types**: Exported `CleanupRegistrar` to describe the cleanup registration callback passed to `effect` functions.
- **Build Artifacts**: Added compiled `dist` output for CommonJS, ESM, and TypeScript declarations.

### Changed

- **Package Identity**: Aligned package naming and metadata around `@phcdevworks/spectre-shell-signals`.
- **Documentation**: Tightened README guidance around the package's reactive-primitives-only ownership.
- **Tooling**: Refreshed development dependencies, including TypeScript, ESLint, TypeScript ESLint, Prettier, and Vitest.

### Fixed

- **Effect Protection**: Added coverage for effects that synchronously trigger themselves.
- **Disposal Coverage**: Added tests for computed dependency cleanup after disposal.

## [0.0.1] - 2026-04-13

Release Title: Phase 1 - Initial Reactive Primitives Foundation

### Added

- **Initial Release**: Published `@phcdevworks/spectre-shell-signals` as the minimal reactive-primitives package for the Spectre system.
- **Reactive Core**: Added framework-agnostic `signal`, `computed`, and `effect` primitives with tracked `.value` access, lazy derivation, synchronous invalidation, and effect cleanup/disposal semantics.
- **Coverage**: Added behavioral tests for unchanged writes, computed caching and laziness, dependency switching, nested computed values, multiple subscribers, and circular computed protection.
- **Tooling**: Added TypeScript build output with `tsup`, Vitest coverage for reactive semantics, and CI validation for build, test, and type-check workflows.
- **Documentation**: Added package README, contribution guidance, and repository metadata aligned to the scoped package and its narrow reactivity-only ownership.

[unreleased]: https://github.com/phcdevworks/spectre-shell-signals/compare/1.1.0...HEAD
[1.1.0]: https://github.com/phcdevworks/spectre-shell-signals/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/phcdevworks/spectre-shell-signals/compare/0.0.1...1.0.0
[0.0.1]: https://github.com/phcdevworks/spectre-shell-signals/tree/0.0.1
