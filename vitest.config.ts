import { join } from 'node:path'

import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^#(.*)\.js$/,
        replacement: join(import.meta.dirname, 'src/$1.ts'),
      },
    ],
  },
  test: {
<<<<<<< before updating
    globals: true,
    environment: 'node',
    // lib/ holds compiled build output (including compiled *.test.js), which
    // duplicates every test run alongside its src/ source when present.
    exclude: [...configDefaults.exclude, 'lib/**'],
||||||| last update
  })
=======
    // Spelled out (matching Vitest's own default) so knip's static analysis
    // of this file can resolve test entry files; Vitest's own runtime
    // behavior is unchanged.
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
>>>>>>> after updating
  },})
