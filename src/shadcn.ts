import { createRequire } from 'node:module'

import type { ESLint, Linter } from 'eslint'

import { vitestTestFiles } from '#vitest.js'

const require = createRequire(import.meta.url)

export interface ShadcnOptions {
  /**
   * Glob patterns for the supported source files to check.
   */
  files: string[]
  /**
   * Additional glob patterns to exclude from the selected files.
   */
  ignores?: string[]
}

export function shadcnConfig(options: ShadcnOptions): Linter.Config[] {
  // Keep this optional peer out of the default config import path.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns any; widened to ESLint.Plugin below
  const {
    plugin: shadcnPlugin,
  }: { plugin: ESLint.Plugin } = require('@shadcn/lint')

  return [
    {
      files: options.files,
      ignores: [...vitestTestFiles, ...(options.ignores ?? [])],
      plugins: { shadcn: shadcnPlugin },
      settings: {
        shadcn: {
          componentImports: ['^@fohte/ui(/|$)'],
        },
      },
      rules: {
        'shadcn/no-restyle': ['error', { allow: ['layout'] }],
        'shadcn/no-inline-styles': 'error',
        'shadcn/require-static-classes': 'error',
        'shadcn/no-unknown-classes': 'error',
        'shadcn/no-raw-colors': 'error',
      },
    },
  ]
}
