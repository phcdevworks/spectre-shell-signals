# Contributing

Thanks for helping improve `@phcdevworks/spectre-shell-signals`. This package owns the low-level reactive primitives, so changes should keep semantics tiny, synchronous, and well tested.

## Workflow

1. Install dependencies with `npm install`.
2. Make the smallest focused change that solves the problem.
3. Update README or changelog notes when public behavior changes.
4. Run `npm run check` before opening a pull request.

## Project Standards

- Keep config files in TypeScript when the tool supports it.
- Keep the public API limited to `signal`, `computed`, `effect`, `batch`, and their types.
- Preserve synchronous dependency tracking semantics.
- Add or update tests before changing cleanup, disposal, or notification behavior.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
npm run test
npm run check:version-sync
npm run check:ecosystem
npm run check
```

`npm run check` is the full gate: typecheck, lint, build, test, README version-sync, and ecosystem validation. All must pass before opening a pull request.

## Versioning

This package follows semantic versioning. See the [Versioning Policy](docs/versioning-policy.md)
for what counts as a breaking, feature, or fix change, and how downstream
Spectre packages are coordinated on major releases.

## Pull Requests

Describe the reactive behavior changed, call out compatibility risks, and include the commands you ran. Populate all sections of the PR template.

## Code of Conduct

By participating in this project, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
