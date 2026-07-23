# @fohte/eslint-config

Personal ESLint configuration package with TypeScript support.

## Installation

```bash
npm install --save-dev @fohte/eslint-config

# Install peer dependencies
npm install --save-dev @eslint-community/eslint-plugin-eslint-comments @typescript-eslint/eslint-plugin @typescript-eslint/parser @vitest/eslint-plugin eslint eslint-config-prettier eslint-plugin-import-x eslint-plugin-simple-import-sort

# Optional: If using TypeScript
npm install --save-dev typescript
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
```

### Built-in rules

In addition to the upstream presets, this config ships a local plugin (`fohte`). Rules are enabled as `error` by default; override them in `eslint.config.js` if needed (e.g. `'fohte/no-inline-object-in-expect': 'off'`).

- `fohte/no-inline-object-in-expect` (test files only): flags `expect(<object/array literal>).toEqual(...)` (and `toStrictEqual` / `toMatchObject`, including `await … .resolves` / `.rejects` / `.not` chains, and `as const` / `satisfies` / `!` wrapped literals). Also flags the same literal aliased through a variable declared right before the `expect()` call. Pass the value under test directly, or split the assertion into multiple `expect()` calls.

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

- `fohte/no-raw-sql-execution-entrypoints` (requires `config({ typescript: { typeChecked: true } })`): flags direct invocations of the postgres.js `Sql` instance (as a tagged template or a call) and drizzle-orm's raw-SQL escape hatches (the `sql` template tag and `db.execute()`). Detection is based on the resolved type, not on variable names, so renaming or destructuring the value doesn't bypass it. Express the query through drizzle's typed query builder instead; if raw SQL is truly unavoidable, disable the rule for that line with a justification comment.

  ```ts
  // bad: the postgres.js Sql instance invoked directly
  await pg`select * from users where id = ${id}`

  // bad: drizzle-orm's raw-SQL escape hatch
  await db.execute(sql`select * from users where id = ${id}`)

  // good
  await db.select().from(users).where(eq(users.id, id))
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
├── index.ts         # Main export
├── main.ts          # Base ESLint configuration
├── typescript.ts    # TypeScript-specific configuration
└── types/           # Type definitions for untyped packages
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
