import { beforeAll, afterAll } from 'vitest'
import { initializeSharedResources, cleanupSharedResources } from './src/__tests__/e2e/helpers/e2e-test-helper-optimized'

// Initialize shared resources before all tests
beforeAll(() => {
  initializeSharedResources()
})

// Clean up shared resources after all tests
afterAll(() => {
  cleanupSharedResources()
})
