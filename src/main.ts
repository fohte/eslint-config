import eslintCommentsPlugin from '@eslint-community/eslint-plugin-eslint-comments'
import type { Linter } from 'eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import importXPlugin from 'eslint-plugin-import-x'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ESLint.Plugin.rules widens to any in strict-type-checked
export const mainConfig: Linter.Config[] = [
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
      'import-x': importXPlugin,
      '@eslint-community/eslint-comments': eslintCommentsPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message:
                'Relative imports are not allowed. Use a # subpath import (package.json "imports" field) instead — see https://nodejs.org/api/packages.html#subpath-imports.',
            },
            {
              group: ['@/*'],
              message:
                'The @ alias is not allowed: it only exists for TypeScript/bundlers and is not resolved by Node at runtime. Use a # subpath import (package.json "imports" field) instead — see https://nodejs.org/api/packages.html#subpath-imports.',
            },
          ],
        },
      ],
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },
  eslintConfigPrettier,
]
