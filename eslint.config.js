import { config } from './lib/index.js'

export default config(
  { typescript: { typeChecked: true } },
  {
    ignores: ['vitest.config.ts'],
  },
)
