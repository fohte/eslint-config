import type { Linter } from 'eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import importXPlugin from 'eslint-plugin-import-x'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const mainConfig: Linter.Config[] = [
  {
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
      'import-x': importXPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
    },
  },
  eslintConfigPrettier,
]
