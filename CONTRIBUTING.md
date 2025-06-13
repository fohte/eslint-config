# Contributing to @fohte/eslint-config

Thank you for considering contributing to @fohte/eslint-config! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct, which promotes a welcoming and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or bun
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/eslint-config.git
   cd eslint-config
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Run linting:
   ```bash
   npm run lint
   ```

## Development Workflow

### Branch Strategy

- `master` branch contains the stable release code
- Create feature branches from `master` for new features or fixes
- Use descriptive branch names (e.g., `feat/add-react-rules`, `fix/typescript-config`)

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes in the `src/` directory
3. Build the project to ensure TypeScript compilation succeeds:
   ```bash
   npm run build
   ```

4. Test your changes by linking the package locally:
   ```bash
   npm link
   # In another project
   npm link @fohte/eslint-config
   ```

### Commit Guidelines

We follow conventional commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes (formatting, missing semicolons, etc.)
- `refactor:` for code refactoring
- `test:` for test additions or modifications
- `chore:` for maintenance tasks

Examples:
```
feat: add support for React hooks linting
fix: resolve TypeScript config import issue
docs: update README with new configuration options
```

### Testing

Before submitting a pull request:

1. Ensure all TypeScript files compile without errors:
   ```bash
   npm run build
   ```

2. Run the linter on the source code:
   ```bash
   npm run lint
   ```

3. Test your changes in a real project to verify they work as expected

## Pull Request Process

1. Update the CHANGELOG.md with your changes under the "Unreleased" section
2. Ensure your code follows the existing code style
3. Update documentation if you're adding new features or changing behavior
4. Submit a pull request with a clear description of the changes
5. Link any related issues in the PR description

### PR Title Format

Use the same conventional commit format for PR titles:
```
feat: add support for React hooks linting
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have updated the documentation accordingly
- [ ] I have added an entry to CHANGELOG.md
```

## Release Process

Releases are automated using [release-please](https://github.com/googleapis/release-please):

1. **Automatic Release PR**: When commits are pushed to `master`, release-please automatically creates or updates a release PR
2. **Version Bumping**: The version is automatically determined based on conventional commits:
   - `fix:` commits trigger a patch release
   - `feat:` commits trigger a minor release
   - `feat!:` or `fix!:` (breaking changes) trigger a major release
3. **Release**: When the release PR is merged, the following happens automatically:
   - Version in `package.json` is updated
   - CHANGELOG.md is updated
   - A git tag is created
   - A GitHub release is created
   - The package is published to npm

### Manual Release (Alternative)

If you need to create a release manually, you can still use:
```bash
npm run bump <version>
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all source files
- Export types and interfaces when they might be useful for consumers
- Avoid using `any` type
- Prefer `const` over `let` when variables won't be reassigned

### File Structure

- Configuration builders go in separate files (e.g., `typescript.ts`)
- Main export should be from `index.ts`
- Type definitions for untyped packages go in `types/`

### ESLint Rules

When adding or modifying ESLint rules:

- Provide clear reasoning for the rule
- Consider the impact on existing codebases
- Prefer warnings over errors for stylistic rules
- Document any opinionated choices

## Questions?

If you have questions about contributing, feel free to:

- Open an issue for discussion
- Check existing issues and pull requests
- Review the codebase for examples

Thank you for contributing to @fohte/eslint-config!