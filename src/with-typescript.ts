import { FlatCompat } from '@eslint/eslintrc'
import typeScriptESLintParser from '@typescript-eslint/parser'
import type { Linter } from 'eslint'

import mainConfig from './main.js'

const compat = new FlatCompat()

const config: Linter.FlatConfig[] = [
  ...mainConfig,

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
  },
]

export default config
