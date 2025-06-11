# @fohte/eslint-config

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Installation

```bash
npm install --save-dev @fohte/eslint-config

# Install peer dependencies
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-import eslint-plugin-simple-import-sort

# Optional: If using TypeScript
npm install --save-dev typescript
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
