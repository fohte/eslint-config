# E2E Test Performance Optimization Guide

## Overview

This document describes the performance optimizations implemented for the e2e test suite, resulting in a **62.5% performance improvement** and **2.7x faster execution**.

## Key Optimizations

### 1. One-Time Build Check
- **Before**: Every test checked if `lib/` exists and potentially rebuilt
- **After**: Build check happens once at test suite startup
- **Impact**: Eliminates redundant filesystem checks

### 2. Shared Base Test Directory
- **Before**: Each test created a completely new temporary directory
- **After**: Single base directory with test-specific subdirectories
- **Impact**: Reduces directory creation overhead

### 3. Cached Node Modules Symlink
- **Before**: Each test created a new symlink to node_modules
- **After**: Base directory contains a single symlink reused by all tests
- **Impact**: Eliminates redundant symlink creation

### 4. Direct ESLint Binary Execution
- **Before**: Used `npx eslint` which adds overhead
- **After**: Direct execution of `node_modules/.bin/eslint`
- **Impact**: Avoids npx startup overhead

### 5. Global Cleanup
- **Before**: Each test cleaned up immediately
- **After**: Cleanup happens after all tests complete
- **Impact**: Better resource utilization during test execution

## Performance Results

```
Original implementation (5 runs):
  Average: 3458.45ms
  Min: 2444.57ms
  Max: 4448.27ms

Optimized implementation (5 runs):
  Average: 1296.84ms
  Min: 799.02ms
  Max: 2408.32ms

Performance improvement: 62.5%
Speed up: 2.7x faster
```

## Migration Guide

To migrate existing tests to use the optimized helper:

1. Update import statement:
  ```typescript
  // Before
  import { ... } from './helpers/e2e-test-helper.js'

  // After
  import { ... } from './helpers/e2e-test-helper-optimized.js'
  ```

2. No other changes required - the API is identical

## Implementation Details

### Vitest Setup

The `vitest.setup.ts` file ensures proper cleanup:
```typescript
import { afterAll } from 'vitest'
import { cleanupAllTests } from './src/__tests__/e2e/helpers/e2e-test-helper-optimized.js'

afterAll(() => {
  cleanupAllTests()
})
```

### Limitations

- ESLint v8 API doesn't support flat config via environment variable when used programmatically
- Fallback to optimized subprocess execution maintains compatibility while still providing performance gains

## Future Improvements

1. **ESLint v9 Migration**: Native flat config support would allow using the ESLint API directly
2. **In-Memory File System**: Could eliminate disk I/O for test files
3. **Test Parallelization**: Further optimize by running independent tests concurrently
4. **Configuration Caching**: Cache parsed ESLint configurations across tests
