import { config } from '#index.js'

export default config(
  { typescript: { typeChecked: true } },
  {
    ignores: ['vitest.config.ts'],
  },
)
