# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning reflects package releases published to npm.

## [Unreleased]

## [0.0.1] - 2026-04-13

Release Title: Initial Reactive Primitives Foundation

### Added

- **Initial Release**: Published `@phcdevworks/spectre-shell-signals` as the minimal reactive-primitives package for the Spectre system.
- **Reactive Core**: Added framework-agnostic `signal`, `computed`, and `effect` primitives with tracked `.value` access, lazy derivation, synchronous invalidation, and effect cleanup/disposal semantics.
- **Coverage**: Added behavioral tests for unchanged writes, computed caching and laziness, dependency switching, nested computed values, multiple subscribers, and circular computed protection.
- **Tooling**: Added TypeScript build output with `tsup`, Vitest coverage for reactive semantics, and CI validation for build, test, and type-check workflows.
- **Documentation**: Added package README, contribution guidance, and repository metadata aligned to the scoped package and its narrow reactivity-only ownership.

[unreleased]: https://github.com/phcdevworks/spectre-shell-signals/compare/0.0.1...HEAD
[0.0.1]: https://github.com/phcdevworks/spectre-shell-signals/tree/0.0.1
