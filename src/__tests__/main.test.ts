import { describe, expect, it } from 'vitest'
import type { Linter } from 'eslint'
import { mainConfig } from '../main.js'

describe('mainConfig', () => {
  it('should be an array of flat configs', () => {
    expect(Array.isArray(mainConfig)).toBe(true)
    expect(mainConfig.length).toBe(2)
  })

  it('should have correct structure for first config', () => {
    const config = mainConfig[0] as Linter.FlatConfig
    expect(config).toBeDefined()
    expect(config.plugins).toBeDefined()
    expect(config.rules).toBeDefined()
  })

  it('should include required plugins', () => {
    const config = mainConfig[0] as Linter.FlatConfig
    expect(config.plugins).toHaveProperty('simple-import-sort')
    expect(config.plugins).toHaveProperty('import')
  })

  it('should include required rules', () => {
    const config = mainConfig[0] as Linter.FlatConfig
    const expectedRules = {
      'no-unused-vars': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    }
    
    expect(config.rules).toEqual(expectedRules)
  })

  it('should include prettier config as second element', () => {
    // The second element should be the prettier config
    const prettierConfig = mainConfig[1]
    expect(prettierConfig).toBeDefined()
    // Prettier config typically has rules property
    expect(prettierConfig).toHaveProperty('rules')
  })
})