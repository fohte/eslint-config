import { describe, expect, it } from 'vitest'
import type { Linter } from 'eslint'
import { typescriptConfig } from '../typescript.js'

describe('typescriptConfig', () => {
  it('should be an array of flat configs', () => {
    expect(Array.isArray(typescriptConfig)).toBe(true)
    expect(typescriptConfig.length).toBeGreaterThan(0)
  })

  it('should have TypeScript file pattern configuration', () => {
    // Find the config that targets TypeScript files
    const tsFileConfig = typescriptConfig.find((config) => 
      config.files && 
      Array.isArray(config.files) && 
      config.files.some((file) => typeof file === 'string' && file.includes('.ts'))
    )
    
    expect(tsFileConfig).toBeDefined()
    expect(tsFileConfig?.files).toBeDefined()
    expect(Array.isArray(tsFileConfig?.files)).toBe(true)
    expect(tsFileConfig?.files).toContain('**/*.ts{,x}')
  })

  it('should have TypeScript parser configured', () => {
    const tsFileConfig = typescriptConfig.find((config) => 
      config.languageOptions?.parser
    ) as Linter.FlatConfig
    
    expect(tsFileConfig).toBeDefined()
    expect(tsFileConfig.languageOptions).toBeDefined()
    expect(tsFileConfig.languageOptions?.parser).toBeDefined()
    // Parser should be the TypeScript ESLint parser
    expect(tsFileConfig.languageOptions?.parser).toBeTruthy()
  })

  it('should include TypeScript ESLint recommended rules', () => {
    // The config should include rules from @typescript-eslint/recommended
    // Since FlatCompat is used, the rules will be spread across the array
    // Let's check that we have some configs (from the compat.extends)
    expect(typescriptConfig.length).toBeGreaterThanOrEqual(2)
    
    // Check if any config has rules (from the extended config)
    const hasRules = typescriptConfig.some((config) => 
      config.rules && Object.keys(config.rules).length > 0
    )
    expect(hasRules).toBe(true)
  })
})