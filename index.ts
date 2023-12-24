import { Linter } from 'eslint'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import importPlugin from 'eslint-plugin-import'

const config: Linter.FlatConfig = {
  plugins: {
    'simple-import-sort': simpleImportSortPlugin,
    import: importPlugin,
  },
  rules: {
    'no-unused-vars': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
  },
}

export default config
