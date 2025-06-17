# Bash commands

## Build and test

```bash
npm run build    # Build TypeScript files
npm run lint     # Run ESLint
npm test         # Run build and lint
```

## Release management

```bash
# Test release-please locally (dry-run)
npx release-please release-pr --repo-url=https://github.com/fohte/eslint-config --token=$GH_TOKEN --dry-run
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

## release-please configuration

- The config uses manifest mode with an empty component for single-package repos
- `include-component-in-tag: false` maintains existing tag format (v0.0.4, not eslint-config-v0.0.4)
- release-please reads config from GitHub, not local files - push changes before testing
