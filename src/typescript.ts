import { FlatCompat } from '@eslint/eslintrc'
import typeScriptESLintParser from '@typescript-eslint/parser'
import type { Linter } from 'eslint'

const compat = new FlatCompat()

export const typescriptConfig: Linter.Config[] = [
  ...compat.extends('plugin:@typescript-eslint/recommended'),

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
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
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

/**
 * Type-checked TypeScript rules that require parserOptions.projectService.
 *
 * Usage: consumers must enable type-aware linting in their own config by
 * setting `languageOptions.parserOptions.projectService: true` (or
 * `parserOptions.project: true`) so the parser can resolve type information.
 */
export const typescriptTypeCheckedConfig: Linter.Config[] = [
  {
    files: ['**/*.ts{,x}'],
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
    },
  },
]
