import type { Linter } from 'eslint'

import { fohtePlugin } from '#rules/index.js'
import { vitestTestFiles } from '#vitest.js'

export interface NoRawFormElementsOptions {
  /**
   * Glob patterns for the files to check. This option is required so the rule
   * only runs in projects that opt in and select a scope.
   */
  files: string[]
  /**
   * Additional glob patterns to exclude from the selected files.
   */
  ignores?: string[]
}

export function noRawFormElementsConfig(
  options: NoRawFormElementsOptions,
): Linter.Config[] {
  return [
    {
      files: options.files,
      ignores: [...vitestTestFiles, ...(options.ignores ?? [])],
      plugins: { fohte: fohtePlugin },
      rules: {
        'fohte/no-raw-form-elements': 'error',
      },
    },
  ]
}
