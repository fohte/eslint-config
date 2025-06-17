import { defineConfig } from 'vitest/config'
import { cpus } from 'node:os'

const cpuCount = cpus().length

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**'],
    setupFiles: ['./vitest.setup.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        // Optimize based on CPU cores
        maxThreads: Math.max(4, cpuCount),
        minThreads: Math.min(2, cpuCount),
      },
    },
  },
})
