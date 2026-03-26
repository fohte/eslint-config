# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: Starting from the next release, this changelog will be automatically maintained by [release-please](https://github.com/googleapis/release-please).

## [0.3.1](https://github.com/fohte/eslint-config/compare/v0.3.0...v0.3.1) (2026-03-26)


### Features

* support additional flat configs via rest params in `config()` ([#329](https://github.com/fohte/eslint-config/issues/329)) ([0512c80](https://github.com/fohte/eslint-config/commit/0512c80e6b26f365658f509ff1bf55a84335e3e0))


### Bug Fixes

* keep `[@typescript-eslint](https://github.com/typescript-eslint)` plugin global in type-checked mode for `.cjs` files ([#330](https://github.com/fohte/eslint-config/issues/330)) ([13d2074](https://github.com/fohte/eslint-config/commit/13d20746ccdb18f7ce178caa5762bad4338e9ba2))

## [0.3.0](https://github.com/fohte/eslint-config/compare/v0.2.0...v0.3.0) (2026-03-23)


### ⚠ BREAKING CHANGES

* replace named config exports with `config()` factory function ([#328](https://github.com/fohte/eslint-config/issues/328))

### Features

* add `typescriptTypeCheckedConfig` with `strict-boolean-expressions` rule ([#322](https://github.com/fohte/eslint-config/issues/322)) ([2070283](https://github.com/fohte/eslint-config/commit/2070283ff32a01edfc14ce57624a798bd2a4558b))
* ban unsafe type assertions with ESLint rules ([#325](https://github.com/fohte/eslint-config/issues/325)) ([66d88dd](https://github.com/fohte/eslint-config/commit/66d88ddb997daeafa07c5073c2a447b6ca8760df))
* migrate TypeScript ESLint configs to strict/strict-type-checked ([#326](https://github.com/fohte/eslint-config/issues/326)) ([6f1f8a9](https://github.com/fohte/eslint-config/commit/6f1f8a956edb6efe1f2cc91e33415362afc1329b))
* replace named config exports with `config()` factory function ([#328](https://github.com/fohte/eslint-config/issues/328)) ([6b91e88](https://github.com/fohte/eslint-config/commit/6b91e884579b5fab41989c646450dc9e1f8d506d))

## [0.2.0](https://github.com/fohte/eslint-config/compare/v0.1.2...v0.2.0) (2026-03-14)


### ⚠ BREAKING CHANGES

* support ESLint v10 by migrating from `eslint-plugin-import` to `eslint-plugin-import-x` ([#319](https://github.com/fohte/eslint-config/issues/319))

### Features

* support ESLint v10 by migrating from `eslint-plugin-import` to `eslint-plugin-import-x` ([#319](https://github.com/fohte/eslint-config/issues/319)) ([249e222](https://github.com/fohte/eslint-config/commit/249e222a8d9e23c1169130cc122d4453d23baad1))

## [0.1.2](https://github.com/fohte/eslint-config/compare/v0.1.1...v0.1.2) (2026-02-07)


### Bug Fixes

* allow `require()` in `.cjs` files ([#99](https://github.com/fohte/eslint-config/issues/99)) ([ed5d757](https://github.com/fohte/eslint-config/commit/ed5d7573095df1a6abc7d25eddfd62030917f212))

## [0.1.1](https://github.com/fohte/eslint-config/compare/v0.1.0...v0.1.1) (2025-06-17)


### Features

* **peerDeps:** Update dependency eslint-config-prettier to v10 ([#82](https://github.com/fohte/eslint-config/issues/82)) ([71a02d2](https://github.com/fohte/eslint-config/commit/71a02d25f4a1858786a1db2b6be19d358c6bdebf))
* **peerDeps:** update eslint and eslint-plugin-simple-import-sort to latest major versions only ([#84](https://github.com/fohte/eslint-config/issues/84)) ([afebfcf](https://github.com/fohte/eslint-config/commit/afebfcfc775abc5f2e1dd64543c16a338c8d1b4c))
* **peerDeps:** Update typescript-eslint monorepo to v8 ([#25](https://github.com/fohte/eslint-config/issues/25)) ([0fe0d1a](https://github.com/fohte/eslint-config/commit/0fe0d1ac46f99070608c7b2aa1e82917d642153c))

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
