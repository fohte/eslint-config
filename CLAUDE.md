# CLAUDE.md

## Code organization rules

### Split files before they grow past ~500 lines of production code

When a change would push a file's non-test code past ~500 lines, split it along responsibility seams before adding more. Splits must be move-only commits: no logic changes, renames, or reformatting mixed in. Keep external import paths unchanged by keeping the entrypoint file in place and re-exporting the pieces you split out into new files (e.g. `index.ts` re-exports from the new files). Tests move together with the code they verify.

Prefer creating a new focused file over appending to the largest existing one.

<<<<<<< before updating
# Bash commands
||||||| last update
## Test code rules
=======
## Error handling rules

### Return a `Result` instead of throwing

`errorHandling` in `eslint.config.js` bans `throw`/`try-catch` in production code and requires every returned `Result` to be consumed (`no-restricted-syntax`, `neverthrow/must-use-result` in `@fohte/eslint-config`). Return a `Result`/`ResultAsync` from [neverthrow](https://github.com/supermacro/neverthrow) instead:

```ts
// bad: throws
function parseConfig(raw: string): Config {
  if (!isValid(raw)) throw new Error('invalid config')
  return JSON.parse(raw)
}

// good: returns a Result
function parseConfig(raw: string): Result<Config, ConfigError> {
  if (!isValid(raw)) return err(new ConfigError('invalid config'))
  return ok(JSON.parse(raw))
}
```

Use `ResultAsync.fromPromise()` or `Result.fromThrowable()` to interop with a throwing API without a local try/catch. If the throw-based contract genuinely can't be wrapped that way, catch the exception, wrap it in a `BoundaryError` subclass (see `src/errors.ts`), and rethrow it — `no-restricted-syntax` bans `try`/`throw` as separate selectors, so both the `try` and the `throw` need their own `eslint-disable-next-line no-restricted-syntax` comment explaining why.

## Test code rules
>>>>>>> after updating

## Build and test

```bash
pnpm run build    # Build TypeScript files
pnpm run lint     # Run ESLint
pnpm test         # Run build and lint
```

## Release management

```bash
# Test release-please locally (dry-run)
pnpm exec release-please release-pr --repo-url=https://github.com/fohte/eslint-config --token=$GH_TOKEN --dry-run
```

# Core files

- `src/`: ESLint configuration source files
- `lib/`: Built JavaScript files (gitignored)
- `release-please-config.json`: Release automation config
- `.release-please-manifest.json`: Current version tracking

# Repository etiquette

## PR titles

- Use `chore:` prefix for configuration changes that shouldn't trigger releases
- Avoid `fix:` or `feat:` prefixes unless you intend to create a release
- **IMPORTANT**: Changes that don't affect the package itself (e.g., CI config, renovate.json5, documentation) should use `chore:` to avoid unnecessary version bumps
- release-please uses conventional commits to determine version bumps:
  - `fix:` → patch version bump
  - `feat:` → minor version bump (or patch if v0.x.x with bump-patch-for-minor-pre-major)
  - `feat!:` or `BREAKING CHANGE:` → major version bump (or minor if v0.x.x with bump-minor-pre-major)

## Commit conventions

- Follow conventional commit format
- Breaking changes in v0.x.x will bump minor version due to `bump-minor-pre-major: true`

# Warnings

## Adding a plugin to `mainConfig`

When wiring a new ESLint plugin into `src/main.ts` (or any exported config), update all three:

- `package.json` `peerDependencies`: declare the plugin so consumers install a compatible version
- `README.md` Installation section: append the plugin to the `npm install --save-dev` peer deps command
- `package.json` `devDependencies`: pin the version used for local development

## release-please configuration

- The config uses manifest mode with an empty component for single-package repos
- `include-component-in-tag: false` maintains existing tag format (v0.0.4, not eslint-config-v0.0.4)
- release-please reads config from GitHub, not local files - push changes before testing

# Test code rules

## Assert on the whole output with a single equality check

Treat each test as a spec: build the expected output as one literal value (object, struct, JSON, array, etc.) and compare it to the actual output with a single equality assertion. Do not split the assertion into per-field checks, and do not use partial matchers (substring contains, `toContain`, `toMatchObject`, prefix/suffix checks, regex-on-substring, etc.). Partial matches silently ignore unexpected fields and extra elements, so the test stops working as a spec the moment the shape of the output changes.

```ts
// bad: picks fields one by one — silent on any new/changed field
const ev = run()
expect(ev.path).toBe('/a')
expect(ev.event).toBe('ok')
expect(ev.message).toContain('done')

// good: one literal, one equality — any drift in shape fails the test
expect(run()).toEqual({
  path: '/a',
  event: 'ok',
  message: 'done',
})
```

For dynamic fields (timestamps, UUIDs, random IDs), normalize them in a helper before the comparison (e.g. replace with a fixed placeholder) so the full output can still be asserted in one equality check. Do not weaken the assertion to dodge the dynamic value.
