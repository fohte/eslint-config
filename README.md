# @fohte/eslint-config

Personal ESLint configuration package with TypeScript support.

## Installation

```bash
npm install @fohte/eslint-config
```

## Usage

`eslint.config.js`:

```javascript
import { mainConfig, typescriptConfig } from '@fohte/eslint-config'

export default [
  ...mainConfig,
  ...typescriptConfig,
]
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
- `npm run bump <version>` - Manual version bump (alternative to automated release)

### Project Structure

```
src/
├── index.ts         # Main export
├── main.ts          # Base ESLint configuration
├── typescript.ts    # TypeScript-specific configuration
└── types/           # Type definitions for untyped packages
```

### Release Process

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases:

1. Make changes and commit using [Conventional Commits](https://www.conventionalcommits.org/):
  - `fix:` for bug fixes (patch release)
  - `feat:` for new features (minor release)
  - `feat!:` or `fix!:` for breaking changes (major release)

2. Push to `master` branch

3. release-please automatically:
  - Creates/updates a Release PR
  - Updates version in package.json
  - Updates CHANGELOG.md
  - Creates GitHub release and git tag when PR is merged
  - Publishes to npm

### Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality. The hooks will automatically run when you commit changes.
