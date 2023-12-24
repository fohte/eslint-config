# @fohte/eslint-config

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Usage

`eslint.config.js`:

```javascript
import { mainConfig, typescriptConfig, nextConfig } from '@fohte/eslint-config'

export default [
  ...mainConfig,
  ...typescriptConfig,
]
```
