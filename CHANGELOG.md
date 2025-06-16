# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: Starting from the next release, this changelog will be automatically maintained by [release-please](https://github.com/googleapis/release-please).

## [0.1.0](https://github.com/fohte/eslint-config/compare/v0.0.4...v0.1.0) (2025-06-15)


### ⚠ BREAKING CHANGES

* move ESLint packages to peerDependencies ([#53](https://github.com/fohte/eslint-config/issues/53))

### Features

* improve package.json for NPM best practices ([#52](https://github.com/fohte/eslint-config/issues/52)) ([f7c8143](https://github.com/fohte/eslint-config/commit/f7c814338b84c8fa9b27ed2d32776bc8c7114633))
* move ESLint packages to peerDependencies ([#53](https://github.com/fohte/eslint-config/issues/53)) ([dbd3468](https://github.com/fohte/eslint-config/commit/dbd3468ec2e81981b4510298396864ff7b0b400d))


### Bug Fixes

* remove manifest mode configuration to fix release PR creation ([#72](https://github.com/fohte/eslint-config/issues/72)) ([08a4edc](https://github.com/fohte/eslint-config/commit/08a4edcef3072d2efb1be840bde8fc1d1f3d2d4f))
* use regexManagers to preserve Node.js version ranges in GitHub Actions ([#69](https://github.com/fohte/eslint-config/issues/69)) ([8c82368](https://github.com/fohte/eslint-config/commit/8c82368c445e01da97c6bad34606e62350b6392d))

## [Unreleased]

### Added
- CHANGELOG.md to track version history
- CONTRIBUTING.md with contribution guidelines

## [0.0.4] - 2023-12-24

### Added
- Bump script for easier version management

### Fixed
- Missing eslint-config-prettier dependency (#5)

## [0.0.3] - 2023-12-24

### Fixed
- CI workflow to include build files in package (#4)

## [0.0.2] - 2023-12-24

### Added
- CI test workflow (#3)

### Fixed
- Made TypeScript config importable (#1)
- Documentation usage examples

## [0.0.1] - 2023-12-24

### Added
- Initial release with ESLint flat config support
- TypeScript support with @typescript-eslint
- Prettier integration via eslint-config-prettier
- Import sorting with eslint-plugin-simple-import-sort
- CI/CD workflow for npm publishing
- Basic project structure with TypeScript compilation

[Unreleased]: https://github.com/fohte/eslint-config/compare/v0.0.4...HEAD
[0.0.4]: https://github.com/fohte/eslint-config/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/fohte/eslint-config/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/fohte/eslint-config/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/fohte/eslint-config/releases/tag/v0.0.1
