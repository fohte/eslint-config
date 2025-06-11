import { describe, expect, it } from 'vitest'
import * as exports from '../index.js'

describe('index.ts exports', () => {
  it('should export mainConfig', () => {
    expect(exports.mainConfig).toBeDefined()
    expect(Array.isArray(exports.mainConfig)).toBe(true)
    expect(exports.mainConfig.length).toBeGreaterThan(0)
  })

  it('should export typescriptConfig', () => {
    expect(exports.typescriptConfig).toBeDefined()
    expect(Array.isArray(exports.typescriptConfig)).toBe(true)
    expect(exports.typescriptConfig.length).toBeGreaterThan(0)
  })

  it('should not export any other properties', () => {
    const expectedExports = ['mainConfig', 'typescriptConfig']
    const actualExports = Object.keys(exports)
    expect(actualExports.sort()).toEqual(expectedExports.sort())
  })
})