# Contributing to Spectre Shell Signals

Thanks for helping improve Spectre Shell Signals. This package provides the minimal reactive primitives — `signal`, `computed`, and `effect` — for the Spectre platform. It is intentionally narrow and must stay that way.

## Package Philosophy

`@phcdevworks/spectre-shell-signals` owns primitive reactivity only. It exists to provide writable signals, lazy computed values, reactive effects, and the dependency tracking and cleanup behavior that makes them work together predictably.

**This package must not grow into a state management framework, store library, or framework adapter.**

---

## Development Philosophy

### 1. Reactive Primitives

**Purpose**: Small, synchronous, framework-agnostic reactivity foundation

**Exports**: `signal`, `computed`, `effect` — and the types that describe them

**Rules**:

- Keep the API tiny and explicit
- Prefer readable internals over abstraction-heavy architecture
- Protect synchronous, predictable semantics
- All source files must be TypeScript with strict types

### 2. Dependency Tracking

**Purpose**: Correct dependency collection, invalidation, and cleanup

**Rules**:

- Changes to tracking semantics require corresponding test coverage
- Do not introduce scheduler complexity beyond minimal reactive correctness
- Cleanup handlers must run before re-run and on disposal

### 3. Build Configuration

**Purpose**: Compile TypeScript to JavaScript with proper types

**Key mechanism**:

- tsup generates ESM and CJS output with declarations
- Vitest for testing reactive semantics
- TypeScript strict mode throughout

**Rules**:

- All source code must compile cleanly
- Follow TypeScript strict mode
- Export types alongside runtime code

### Golden Rule (Non-Negotiable)

**If a feature is not directly required for `signal`, `computed`, `effect`, tracking, invalidation, or disposal, it does not belong here.**

- If it's a store or state container → it does not belong here
- If it's a framework hook → it does not belong here
- If it's a reactive primitive → belongs in `src/`
- If it tests reactive semantics → belongs in `tests/`

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/phcdevworks/spectre-shell-signals.git
cd spectre-shell-signals
```

2. Install dependencies:

```bash
npm install
```

3. Validate the package (build + test + typecheck):

```bash
npm run check
# or run steps individually:
npm run build
npm test
npm run lint
```

## Project Structure

```
spectre-shell-signals/
├── src/
│   ├── signal.ts             # Writable signal primitive
│   ├── computed.ts           # Lazy computed primitive
│   ├── effect.ts             # Reactive effect primitive
│   ├── internals/
│   │   ├── node.ts           # Reactive graph node
│   │   └── tracking.ts       # Dependency tracking context
│   └── index.ts              # Public API
├── tests/
│   └── signals.test.ts       # Reactive behavior coverage
├── dist/                     # Built assets (generated)
├── tsconfig.json
└── package.json
```

**Responsibilities**:

- **Primitive authors**: Edit `src/` files for signal, computed, effect behavior
- **Test writers**: Update `tests/` to lock reactive semantics
- **Config maintainers**: Update TypeScript and tsup configs
- **Build engineers**: Update packaging when export structure changes

## Contribution Guidelines

### Primitive Development

1. **Stay narrow** – Only add what directly supports `signal`, `computed`, or `effect`
2. **Test semantics first** – Add tests before changing reactive behavior
3. **Type everything** – TypeScript strict mode, avoid `any`
4. **Prefer clarity** – Readable internals over clever abstractions

### Source File Development

- Use TypeScript for type safety
- Follow modern ES module patterns
- Keep internals simple and easy to reason about
- Do not add framework-specific behavior

### Code Quality

- Run `npm run check` before committing
- Avoid `any` — use explicit types or `unknown`
- Keep the public API exactly as small as it needs to be

### Documentation

- Update README.md when changing the public API or behavior
- Include examples for any new primitives
- Document breaking changes in CHANGELOG.md

## Pull Request Process

1. **Branch from `main`**
2. **Make your changes** and test locally (`npm run check`)
3. **Add or update tests** for any behavior that changed
4. **Update documentation** (README.md, CHANGELOG.md) to reflect changes
5. **Open a PR** describing:
   - The motivation for the change
   - What was changed
   - Testing notes (reactive edge cases covered)
6. **Respond to feedback** and make requested changes

## Known Gaps (Not Done Yet)

- `onCleanup` API stabilization and documentation
- Batched updates / transaction semantics (if needed for correctness)
- Additional edge-case coverage for nested computed values
- CI pipeline for automated build and test validation

## Questions or Issues?

Please open an issue or discussion on GitHub if you're unsure about the best approach for a change. Coordinating early avoids scope creep and conflicts with:

- Reactive primitive semantics
- Public API surface discipline
- TypeScript type safety

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
