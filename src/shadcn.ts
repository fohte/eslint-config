import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import type { ESLint, Linter } from 'eslint'

import { vitestTestFiles } from '#vitest.js'

const require = createRequire(import.meta.url)
const FOHTE_UI_TOKENS_FILE = '@fohte/ui/tokens.css'

function fohteUiThemeColorAllowList(): string[] {
  const projectRequire = createRequire(join(process.cwd(), 'package.json'))
  const lookupPaths = projectRequire.resolve.paths(FOHTE_UI_TOKENS_FILE) ?? []
  const packageIsInstalled = lookupPaths.some((lookupPath) =>
    existsSync(join(lookupPath, '@fohte/ui', 'package.json')),
  )

  if (!packageIsInstalled) return []

  const tokensCssPath = projectRequire.resolve(FOHTE_UI_TOKENS_FILE)
  const tokensCss = readFileSync(tokensCssPath, 'utf-8')
  const allowedColors = new Set<string>()

  for (const [, color] of tokensCss.matchAll(/--color-([\w-]+)\s*:/g)) {
    if (color !== undefined) allowedColors.add(`*-${color}`)
  }

  return [...allowedColors]
}

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
  const themeColorAllowList = fohteUiThemeColorAllowList()

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
        'shadcn/no-raw-colors':
          themeColorAllowList.length > 0
            ? ['error', { allow: themeColorAllowList }]
            : 'error',
      },
    },
  ]
}
