import { config } from '#index.js'

export default config(
  {
    typescript: { typeChecked: true },
    errorHandling: {},
  },
  {
    ignores: ['vitest.config.ts'],
  },
)
