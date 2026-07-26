import type { Linter } from 'eslint'

import { fohtePlugin } from '#rules/index.js'

const testFiles = [
  '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
  '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
]

export const fohteConfig: Linter.Config[] = [
  {
    files: testFiles,
    plugins: {
      fohte: fohtePlugin,
    },
    rules: {
      'fohte/no-inline-object-in-expect': 'error',
    },
  },
]
