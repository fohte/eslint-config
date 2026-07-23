import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // lib/ holds compiled build output (including compiled *.test.js), which
    // duplicates every test run alongside its src/ source when present.
    exclude: [...configDefaults.exclude, 'lib/**'],
  },
})
