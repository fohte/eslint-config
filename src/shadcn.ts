import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'

import type { ESLint, Linter } from 'eslint'
import { Result } from 'neverthrow'

import { vitestTestFiles } from '#vitest.js'

const require = createRequire(import.meta.url)
const FOHTE_UI_TOKENS_FILE = '@fohte/ui/tokens.css'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function packageDeclaresFohteUi(packageJson: unknown): boolean {
  if (!isRecord(packageJson)) return false

  return [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ].some((section) => {
    const dependencies = packageJson[section]

    return isRecord(dependencies) && Object.hasOwn(dependencies, '@fohte/ui')
  })
}

function fohteUiThemeColorAllowList(rootDir: string): string[] {
  const projectRoot = resolve(rootDir)
  const projectRequire = createRequire(join(projectRoot, 'package.json'))

  return Result.fromThrowable(() => {
    const packageJson: unknown = JSON.parse(
      readFileSync(join(projectRoot, 'package.json'), 'utf-8'),
    )
    if (!packageDeclaresFohteUi(packageJson)) return []

    const tokensCssPath = projectRequire.resolve(FOHTE_UI_TOKENS_FILE)
    const tokensCss = readFileSync(tokensCssPath, 'utf-8')
    const allowedColors = new Set<string>()

    for (const [, color] of tokensCss.matchAll(/--color-([\w-]+)\s*:/g)) {
      if (color !== undefined) allowedColors.add(`*-${color}`)
    }

    return [...allowedColors]
  })().unwrapOr([])
}

export interface ShadcnOptions {
  /**
   * Project root that declares @fohte/ui, used to resolve its theme tokens.
   * Defaults to the current working directory.
   */
  rootDir?: string
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
  const themeColorAllowList = fohteUiThemeColorAllowList(
    options.rootDir ?? process.cwd(),
  )

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
