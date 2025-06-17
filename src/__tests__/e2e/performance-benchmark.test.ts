import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { performance } from 'node:perf_hooks'

// Import both helpers
import * as originalHelper from './helpers/e2e-test-helper.js'
import * as optimizedHelper from './helpers/e2e-test-helper-optimized.js'

describe('Performance Benchmark', { timeout: 60000 }, () => {
  const testRuns = 5 // Number of runs for each test

  const testFile = {
    path: 'test.ts',
    content: `import { z } from 'zod'
import React from 'react'
import { helper } from './helper'

interface User {
  id: string
  name: string
}

export function processData(data: any) {
  const user: User = { id: '1', name: 'Test' }
  console.log(helper, React.version, z.string())
  return user
}
`
  }

  afterAll(() => {
    // Ensure cleanup for optimized helper
    optimizedHelper.cleanupAllTests()
  })

  it('compares original vs optimized helper performance', async () => {
    console.log('\n=== Performance Benchmark Results ===\n')

    // Benchmark original helper
    const originalTimes: number[] = []

    for (let i = 0; i < testRuns; i++) {
      const start = performance.now()

      await originalHelper.withTestProject({
        files: [testFile]
      }, async (projectDir) => {
        await originalHelper.runESLint(projectDir)
      })

      const elapsed = performance.now() - start
      originalTimes.push(elapsed)
    }

    // Benchmark optimized helper
    const optimizedTimes: number[] = []

    for (let i = 0; i < testRuns; i++) {
      const start = performance.now()

      await optimizedHelper.withTestProject({
        files: [testFile]
      }, async (projectDir) => {
        await optimizedHelper.runESLint(projectDir)
      })

      const elapsed = performance.now() - start
      optimizedTimes.push(elapsed)
    }

    // Calculate statistics
    const avgOriginal = originalTimes.reduce((a, b) => a + b, 0) / originalTimes.length
    const avgOptimized = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length
    const improvement = ((avgOriginal - avgOptimized) / avgOriginal) * 100

    console.log(`Original implementation (${testRuns} runs):`)
    console.log(`  Average: ${avgOriginal.toFixed(2)}ms`)
    console.log(`  Min: ${Math.min(...originalTimes).toFixed(2)}ms`)
    console.log(`  Max: ${Math.max(...originalTimes).toFixed(2)}ms`)
    console.log(`  All times: ${originalTimes.map(t => t.toFixed(0)).join(', ')}ms`)

    console.log(`\nOptimized implementation (${testRuns} runs):`)
    console.log(`  Average: ${avgOptimized.toFixed(2)}ms`)
    console.log(`  Min: ${Math.min(...optimizedTimes).toFixed(2)}ms`)
    console.log(`  Max: ${Math.max(...optimizedTimes).toFixed(2)}ms`)
    console.log(`  All times: ${optimizedTimes.map(t => t.toFixed(0)).join(', ')}ms`)

    console.log(`\nPerformance improvement: ${improvement.toFixed(1)}%`)
    console.log(`Speed up: ${(avgOriginal / avgOptimized).toFixed(1)}x faster`)

    // The optimized version should be significantly faster
    expect(avgOptimized).toBeLessThan(avgOriginal)
  })

  it('measures startup overhead reduction', async () => {
    console.log('\n=== Startup Overhead Comparison ===\n')

    // Measure just the project creation time
    const originalSetupTimes: number[] = []
    const optimizedSetupTimes: number[] = []

    for (let i = 0; i < 3; i++) {
      // Original
      const start1 = performance.now()
      const projectDir1 = await originalHelper.createTestProject({
        files: [testFile]
      })
      const elapsed1 = performance.now() - start1
      originalSetupTimes.push(elapsed1)
      originalHelper.cleanupTestProject(projectDir1)

      // Optimized
      const start2 = performance.now()
      const projectDir2 = await optimizedHelper.createTestProject({
        files: [testFile]
      })
      const elapsed2 = performance.now() - start2
      optimizedSetupTimes.push(elapsed2)
      optimizedHelper.cleanupTestProject(projectDir2)
    }

    const avgOriginalSetup = originalSetupTimes.reduce((a, b) => a + b, 0) / originalSetupTimes.length
    const avgOptimizedSetup = optimizedSetupTimes.reduce((a, b) => a + b, 0) / optimizedSetupTimes.length

    console.log(`Original setup time: ${avgOriginalSetup.toFixed(2)}ms`)
    console.log(`Optimized setup time: ${avgOptimizedSetup.toFixed(2)}ms`)
    console.log(`Setup improvement: ${((avgOriginalSetup - avgOptimizedSetup) / avgOriginalSetup * 100).toFixed(1)}%`)
  })
})
