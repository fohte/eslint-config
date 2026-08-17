import { config } from '#index.js'

<<<<<<< before updating
export default config(
  {
    typescript: { typeChecked: true },
    errorHandling: {},
  },
  {
    ignores: ['vitest.config.ts'],
  },
)
||||||| last update
export default config(
  {
    typescript: { typeChecked: true },
    errorHandling: {},
  },
)
=======
export default config({
  typescript: { typeChecked: true },
  errorHandling: {},
})
>>>>>>> after updating
