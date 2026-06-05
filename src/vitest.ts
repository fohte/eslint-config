import vitestPlugin from '@vitest/eslint-plugin'
import type { Linter } from 'eslint'

export const vitestTestFiles = [
  '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
  '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
]

export const vitestConfig: Linter.Config[] = [
  {
    files: vitestTestFiles,
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expect*'] },
      ],
    },
  },
]
