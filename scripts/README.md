# Scripts

## validate-package.js

A validation script that ensures the npm package contents are correct before publishing.

### What it does

- Runs `npm pack --dry-run` to get the exact list of files that would be published
- Validates that all required files are included (based on package.json configuration)
- Checks for forbidden files that shouldn't be published (test files, source maps, etc.)
- Uses npm's actual packaging logic instead of maintaining a separate file list

### Usage

```bash
# Run directly
node scripts/validate-package.js

# Or use npm script
npm run validate-package
```

### How it works

1. **Reads package.json** to understand the expected package structure (main, types, exports)
2. **Runs npm pack --dry-run** to get the list of files that would be included
3. **Validates required files** - ensures all entry points and type definitions are included
4. **Checks forbidden patterns** - ensures no test files, source maps, or source code is included

### Benefits

- Automatically adapts to changes in package.json `files` field
- Respects `.npmignore` if added in the future
- No need to manually update file lists when package structure changes
- Catches packaging issues before publishing
