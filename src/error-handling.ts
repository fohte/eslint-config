import { createRequire } from 'node:module'

import type neverthrowPluginType from '@ninoseki/eslint-plugin-neverthrow'
import type { Linter } from 'eslint'

import type { RestrictedSyntaxOption } from './opentelemetry.js'
import { vitestTestFiles } from './vitest.js'

const require = createRequire(import.meta.url)

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- reserved for future options; presence (vs. undefined) is what toggles errorHandlingConfig on in config.ts
export interface ErrorHandlingOptions {}

export function errorHandlingConfig(
  // ESLint flat config fully replaces a rule's settings — rather than
  // merging them — when two config objects set the same rule for the same
  // file. Any other no-restricted-syntax selectors that must apply to the
  // same file set (e.g. openTelemetryRestrictedSyntaxOptions) have to be
  // merged into this same rule entry instead of their own config object, or
  // whichever config is pushed last would silently drop this one's throw/
  // try-catch ban.
  extraRestrictedSyntax: RestrictedSyntaxOption[] = [],
): Linter.Config[] {
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
      ignores: vitestTestFiles,
      plugins: {
        neverthrow: neverthrowPlugin,
      },
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ThrowStatement',
            message:
              "Don't throw — return a Result via err()/errAsync(), or use ResultAsync.fromPromise() to interop with a throwing API without a local throw. If an external SDK's throw-based contract genuinely can't be wrapped that way, add an eslint-disable-next-line comment explaining why.",
          },
          {
            selector: 'TryStatement',
            message:
              "Don't use try/catch — use ResultAsync.fromPromise()/.andThen()/.mapErr()/.match() to turn a failure into a Result value. If an external SDK's throw-based contract genuinely can't be wrapped that way, add an eslint-disable-next-line comment explaining why.",
          },
          ...extraRestrictedSyntax,
        ],
        'neverthrow/must-use-result': 'error',
      },
    },
  ]
}
