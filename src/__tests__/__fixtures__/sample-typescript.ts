// TypeScript specific issues to test
// import type { Config } from './types'
// import { helper } from './helper'
// React import would be here in a real project

// Mock types for testing
type Config = { test: boolean }
const helper = (data: any) => data

// This should trigger @typescript-eslint/no-explicit-any
function processData(data: any): any {
  return data
}

// This should NOT trigger an error (unused vars are off)
export function useHelper() {
  const unusedVar: string = 'test'
  const result = processData({ test: true })
  
  return helper(result)
}

// Test for proper type imports handling
export type { Config }

// Multiple exports on same line (should trigger simple-import-sort/exports)
export { helper }
export { processData }