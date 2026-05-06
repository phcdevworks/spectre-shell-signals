# Contributing

Thanks for helping improve `@phcdevworks/spectre-shell-signals`. This package owns the low-level reactive primitives, so changes should keep semantics tiny, synchronous, and well tested.

## Workflow

1. Install dependencies with `npm install`.
2. Make the smallest focused change that solves the problem.
3. Update README or changelog notes when public behavior changes.
4. Run `npm run check` before opening a pull request.

## Project Standards

- Keep config files in TypeScript when the tool supports it.
- Keep the public API limited to `signal`, `computed`, `effect`, and their types.
- Preserve synchronous dependency tracking semantics.
- Add or update tests before changing cleanup, disposal, or notification behavior.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
npm run test
npm run check
```

## Pull Requests

Describe the reactive behavior changed, call out compatibility risks, and include the commands you ran.
