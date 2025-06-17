import { afterAll } from 'vitest'
import { cleanupAllTests } from './src/__tests__/e2e/helpers/e2e-test-helper-optimized.js'

// Clean up all test resources after all tests complete
afterAll(() => {
  cleanupAllTests()
})
