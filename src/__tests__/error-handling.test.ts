import neverthrowPlugin from '@ninoseki/eslint-plugin-neverthrow'
import { describe, expect, it } from 'vitest'

import { errorHandlingConfig } from '../error-handling.js'

describe('errorHandlingConfig', () => {
  it('bans throw/try-catch and discarded neverthrow Results outside the interop boundary and test files', () => {
    const result = errorHandlingConfig({
      interopBoundaryFiles: ['src/legacy/**/*.ts'],
    })

    expect(result).toEqual([
      {
        files: ['**/*.ts{,x}'],
        ignores: [
          '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
          '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
          'src/legacy/**/*.ts',
        ],
        plugins: { neverthrow: neverthrowPlugin },
        rules: {
          'no-restricted-syntax': [
            'error',
            {
              selector: 'ThrowStatement',
              message:
                "Don't throw — return a Result via err()/errAsync(), or use ResultAsync.fromPromise() to interop with a throwing API without a local throw. Only files listed in errorHandling.interopBoundaryFiles may throw, to satisfy an external SDK's throw-based contract.",
            },
            {
              selector: 'TryStatement',
              message:
                "Don't use try/catch — use ResultAsync.fromPromise()/.andThen()/.mapErr()/.match() to turn a failure into a Result value. Only files listed in errorHandling.interopBoundaryFiles may use try/catch, to satisfy an external SDK's throw-based contract.",
            },
          ],
          'neverthrow/must-use-result': 'error',
        },
      },
    ])
  })
})
