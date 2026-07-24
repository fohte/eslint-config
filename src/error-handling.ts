import { createRequire } from 'node:module'

import type neverthrowPluginType from '@ninoseki/eslint-plugin-neverthrow'
import type { Linter } from 'eslint'

import type { RestrictedSyntaxOption } from './opentelemetry.js'
import { vitestTestFiles } from './vitest.js'

const require = createRequire(import.meta.url)

export interface ErrorHandlingOptions {
  /**
   * Glob patterns for the interop boundary: files that bridge to a
   * throw/reject-based external API (SDK callbacks, framework handlers) or
   * to process bootstrap that must fail fast. Test files are always exempt
   * regardless of this option; these globs add further exemptions on top of
   * that for the throw/try-catch ban and the neverthrow Result enforcement
   * below.
   */
  interopBoundaryFiles: string[]
}

export function errorHandlingConfig(
  options: ErrorHandlingOptions,
  // ESLint flat config fully replaces a rule's settings — rather than
  // merging them — when two config objects set the same rule for the same
  // file. Any other no-restricted-syntax selectors that must apply to the
  // same file set (e.g. openTelemetryRestrictedSyntaxOptions) have to be
  // merged into this same rule entry instead of their own config object, or
  // whichever config is pushed last would silently drop this one's throw/
  // try-catch ban.
  extraRestrictedSyntax: RestrictedSyntaxOption[] = [],
): Linter.Config[] {
  const { interopBoundaryFiles } = options

  // Lazily required (not statically imported) so importing @fohte/eslint-config
  // doesn't force this optional peer dependency to resolve for consumers who
  // don't opt into errorHandling. .default unwraps the CJS-interop shape
  // (`{ __esModule, default, ...namedExports }`) Node's require(esm) produces
  // for this ESM-only package, down to the same value a static import would give.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns any; typed via the type-only import above
  const {
    default: neverthrowPlugin,
  }: {
    default: typeof neverthrowPluginType
  } = require('@ninoseki/eslint-plugin-neverthrow')

  return [
    {
      files: ['**/*.ts{,x}'],
      ignores: [...vitestTestFiles, ...interopBoundaryFiles],
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
          ...extraRestrictedSyntax,
        ],
        'neverthrow/must-use-result': 'error',
      },
    },
  ]
}
