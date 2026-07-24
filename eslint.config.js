import { config } from './lib/index.js'

export default config(
  { typescript: { typeChecked: true } },
  {
    ignores: ['vitest.config.ts'],
  },
  // This package ships compiled output to lib/ via tsc, so switching src/ to
  // # subpath imports would need conditions to resolve differently between
  // src and lib.
  {
    rules: {
      'no-restricted-imports': 'off',
    },
  },
)
