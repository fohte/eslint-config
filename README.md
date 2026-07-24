# @fohte/eslint-config

Personal ESLint configuration package with TypeScript support.

## Installation

```bash
npm install --save-dev @fohte/eslint-config

# Install peer dependencies
npm install --save-dev @eslint-community/eslint-plugin-eslint-comments @typescript-eslint/eslint-plugin @typescript-eslint/parser @vitest/eslint-plugin eslint eslint-config-prettier eslint-plugin-import-x eslint-plugin-simple-import-sort

# Optional: If using TypeScript
npm install --save-dev typescript

# Optional: If using the errorHandling option
npm install --save-dev @ninoseki/eslint-plugin-neverthrow
npm install neverthrow
```

## Usage

`eslint.config.js`:

```javascript
import { config } from '@fohte/eslint-config'

// Basic (JS + TypeScript strict rules)
export default config()

// Alternatively, enable type-checked rules
// (strict-type-checked + strict-boolean-expressions):
// export default config({ typescript: { typeChecked: true } })

// Optionally, ban throw/try-catch and enforce neverthrow Result handling
// (requires typescript.typeChecked: true):
// export default config({
//   typescript: { typeChecked: true },
//   errorHandling: {},
// })

// Optionally, ban raw tracer.startSpan()/startActiveSpan() calls that skip context.with():
// export default config({ opentelemetry: { enabled: true } })
```

### `errorHandling` option

Requires `typescript.typeChecked: true`, because `neverthrow/must-use-result` needs type information to detect unused `Result` values.

When enabled, it applies two rules to all `.ts{,x}` files except test files:

- `no-restricted-syntax`: bans `throw` and `try`/`catch`. Return a `Result` via `err()`/`errAsync()` instead, or use `ResultAsync.fromPromise()` to interop with a throwing API without a local `throw`. If an external SDK's throw-based contract genuinely can't be wrapped that way, add an `eslint-disable-next-line` comment explaining why:

  ```ts
  // eslint-disable-next-line no-restricted-syntax -- interops with an external SDK's throw-based contract
  try {
    return externalSdkCall()
  } catch (error) {
    return err(error)
  }
  ```

- [`neverthrow/must-use-result`](https://www.npmjs.com/package/@ninoseki/eslint-plugin-neverthrow): bans discarding a [`neverthrow`](https://github.com/supermacro/neverthrow) `Result`/`ResultAsync` without handling it.

### `opentelemetry` option

When enabled, `no-restricted-syntax` bans direct calls to `tracer.startSpan()`/`tracer.startActiveSpan()` on all `.ts{,x}` files, since both can silently produce a span that fails to parent child spans created during its execution:

- `startSpan()` never enters the active context on its own — a child span (e.g. an HTTP call fired during this span) won't be nested under it unless the caller explicitly wraps the surrounding code in `context.with(trace.setSpan(context.active(), span), ...)`.
- `startActiveSpan()`'s callback runs inside the active context automatically, but only for the callback's own duration — storing the span to `end()` it later (e.g. start and end split across separate callbacks) drops it from the active context before that later code runs.

This surfaces only as a mis-parented span in a trace backend, not as a runtime error. If neither pattern fits, add an `eslint-disable-next-line` comment explaining why.

When combined with `errorHandling`, both options configure `no-restricted-syntax` — ESLint's flat config fully replaces a rule's settings (rather than merging them) when two config objects set the same rule for the same file, so the `startSpan`/`startActiveSpan` selectors are merged into `errorHandling`'s `no-restricted-syntax` entry instead of their own config. This means the `opentelemetry` ban then shares `errorHandling`'s exemption for test files too.

### Built-in rules

In addition to the upstream presets, this config ships a local plugin (`fohte`) for test files. Rules are enabled as `error` by default; override them in `eslint.config.js` if needed (e.g. `'fohte/no-inline-object-in-expect': 'off'`).

- `fohte/no-inline-object-in-expect`: flags `expect(<object/array literal>).toEqual(...)` (and `toStrictEqual` / `toMatchObject`, including `await … .resolves` / `.rejects` / `.not` chains, and `as const` / `satisfies` / `!` wrapped literals). Also flags the same literal aliased through a variable declared right before the `expect()` call. Pass the value under test directly, or split the assertion into multiple `expect()` calls.

  ```ts
  // bad
  expect({ result, calls: spy.mock.calls.length }).toEqual({
    result: 'ok',
    calls: 0,
  })

  // bad: aliasing the literal through a variable doesn't escape the rule
  const actual = { result, calls: spy.mock.calls.length }
  expect(actual).toEqual({ result: 'ok', calls: 0 })

  // good
  expect(result).toBe('ok')
  expect(spy).not.toHaveBeenCalled()
  ```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run watch
```

### Scripts

- `npm run build` - Compile TypeScript files
- `npm run watch` - Watch mode for development
- `npm run lint` - Run ESLint on source files
- `npm run test` - Run build and lint

### Project Structure

```
src/
├── index.ts           # Main export
├── main.ts            # Base ESLint configuration
├── typescript.ts      # TypeScript-specific configuration
├── error-handling.ts  # errorHandling option (throw/try-catch ban, neverthrow enforcement)
├── opentelemetry.ts   # opentelemetry option (startSpan/startActiveSpan ban)
└── types/             # Type definitions for untyped packages
```

### Release Process

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases.

#### 1. Create a feature branch and make changes

- Create a new branch from `master`
- Make your changes (commit messages don't need to follow any specific format)

#### 2. Create a PR and merge to master

- Push your branch and create a PR
- **PR title must follow [Conventional Commits](https://www.conventionalcommits.org/)**:
  - `fix:` for bug fixes (patch release)
  - `feat:` for new features (minor release)
  - `feat!:` or `fix!:` for breaking changes (major release)
- After review, merge the PR (squash merge only)

#### 3. Automated release process

When changes are merged to `master`, release-please automatically:

- Creates/updates a Release PR
- Updates version in package.json
- Updates CHANGELOG.md
- When the Release PR is merged:
  - Creates GitHub release and git tag
  - Publishes to npm

### Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality. The hooks will automatically run when you commit changes.
