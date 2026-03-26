import { FlatCompat } from '@eslint/eslintrc'
import typeScriptESLintParser from '@typescript-eslint/parser'
import type { Linter } from 'eslint'

const compat = new FlatCompat()

// Parser and .cjs exception shared by both typescriptConfig and the
// typeChecked branch of config(). Extracted to avoid duplicating strict
// rules when strict-type-checked (a superset) is already included.
export const typescriptBaseConfig: Linter.Config[] = [
  {
    files: ['**/*.ts{,x}'],
    languageOptions: {
      // FIXME: This is a workaround for a possible bug in @typescript-eslint/parser.
      // The types of 'parseForESLint(...).ast.fomments' are incompatible between these types.
      //   Type 'Comment[] | undefined' is not assignable to type 'Comment[]'.
      //     Type 'undefined' is not assignable to type 'Comment[]'.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: typeScriptESLintParser as any,
    },
  },

  // CommonJS files legitimately use require()
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]

export const typescriptConfig: Linter.Config[] = [
  ...compat.extends('plugin:@typescript-eslint/strict'),
  ...typescriptBaseConfig,
]

/**
 * Type-checked TypeScript rules that require parserOptions.projectService.
 *
 * Usage: consumers must enable type-aware linting in their own config by
 * setting `languageOptions.parserOptions.projectService: true` (or
 * `parserOptions.project: true`) so the parser can resolve type information.
 */
export const typescriptTypeCheckedConfig: Linter.Config[] = [
  // Scope rules to .ts{,x} only, but keep plugin registration global so
  // that other file types (e.g. .cjs) can reference @typescript-eslint
  // rule names in eslint-disable comments without "unknown rule" errors.
  ...compat
    .extends('plugin:@typescript-eslint/strict-type-checked')
    .map((config) => {
      if (config.files) return config

      // Plugin-only entries (no rules) stay global
      if (!config.rules || Object.keys(config.rules).length === 0) {
        return config
      }

      // Entries with rules get scoped to TypeScript files
      const { plugins, ...rest } = config
      const scoped: Linter.Config[] = [{ ...rest, files: ['**/*.ts{,x}'] }]
      // Re-export plugin registration without file restriction
      if (plugins && Object.keys(plugins).length > 0) {
        scoped.unshift({ plugins })
      }
      return scoped
    })
    .flat(),

  {
    files: ['**/*.ts{,x}'],
    rules: {
      // Not included in strict-type-checked; requires explicit opt-in
      '@typescript-eslint/strict-boolean-expressions': 'error',
      // Only included in 'all' config; requires explicit opt-in
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
    },
  },
]
