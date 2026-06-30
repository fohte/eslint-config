import vitestPlugin from '@vitest/eslint-plugin'
import type { Linter } from 'eslint'

import { fohtePlugin } from './rules/index.js'

const vitestTestFiles = [
  '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
  '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
]

export const vitestConfig: Linter.Config[] = [
  {
    files: vitestTestFiles,
    plugins: {
      vitest: vitestPlugin,
      fohte: fohtePlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expect*'] },
      ],
      'fohte/no-inline-object-in-expect': 'error',
    },
  },
]
