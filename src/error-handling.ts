import neverthrowPlugin from '@ninoseki/eslint-plugin-neverthrow'
import type { Linter } from 'eslint'

export interface ErrorHandlingOptions {
  /**
   * Glob patterns for the interop boundary: files that bridge to a
   * throw/reject-based external API (SDK callbacks, framework handlers) or
   * to process bootstrap that must fail fast. These are the only files
   * exempt from the throw/try-catch ban and the neverthrow Result
   * enforcement below.
   */
  interopBoundaryFiles: string[]
}

const testFiles = [
  '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
  '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
]

export function errorHandlingConfig(
  options: ErrorHandlingOptions,
): Linter.Config[] {
  const { interopBoundaryFiles } = options

  return [
    {
      files: ['**/*.ts{,x}'],
      ignores: [...testFiles, ...interopBoundaryFiles],
      plugins: {
        neverthrow: neverthrowPlugin,
      },
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
  ]
}
