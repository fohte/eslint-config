import { describe, expect, it } from 'vitest'
import type { Linter } from 'eslint'
import { mainConfig, typescriptConfig } from '../index.js'

describe('Configuration Structure', () => {
  describe('mainConfig structure', () => {
    it('should be an array of flat configs', () => {
      expect(Array.isArray(mainConfig)).toBe(true)
      expect(mainConfig.length).toBe(2)
    })

    it('should have plugins in first config', () => {
      const config = mainConfig[0] as Linter.FlatConfig
      expect(config.plugins).toBeDefined()
      expect(config.plugins).toHaveProperty('simple-import-sort')
      expect(config.plugins).toHaveProperty('import')
    })

    it('should have rules in first config', () => {
      const config = mainConfig[0] as Linter.FlatConfig
      expect(config.rules).toBeDefined()
      expect(config.rules).toHaveProperty('no-unused-vars', 'off')
      expect(config.rules).toHaveProperty('simple-import-sort/imports', 'error')
      expect(config.rules).toHaveProperty('simple-import-sort/exports', 'error')
      expect(config.rules).toHaveProperty('import/first', 'error')
      expect(config.rules).toHaveProperty('import/newline-after-import', 'error')
      expect(config.rules).toHaveProperty('import/no-duplicates', 'error')
    })

    it('should include prettier config as second element', () => {
      const prettierConfig = mainConfig[1]
      expect(prettierConfig).toBeDefined()
      expect(prettierConfig).toHaveProperty('rules')
    })
  })

  describe('typescriptConfig structure', () => {
    it('should be an array of flat configs', () => {
      expect(Array.isArray(typescriptConfig)).toBe(true)
      expect(typescriptConfig.length).toBeGreaterThan(0)
    })

    it('should have TypeScript file configuration', () => {
      const tsFileConfig = typescriptConfig.find((config) => 
        config.files && 
        Array.isArray(config.files) && 
        config.files.some((file) => typeof file === 'string' && file.includes('.ts'))
      )
      
      expect(tsFileConfig).toBeDefined()
      expect(tsFileConfig?.files).toContain('**/*.ts{,x}')
    })

    it('should have TypeScript parser configured', () => {
      const tsParserConfig = typescriptConfig.find((config) => 
        config.languageOptions?.parser
      )
      
      expect(tsParserConfig).toBeDefined()
      expect(tsParserConfig?.languageOptions?.parser).toBeTruthy()
    })

    it('should include TypeScript ESLint rules', () => {
      const hasRules = typescriptConfig.some((config) => 
        config.rules && Object.keys(config.rules).length > 0
      )
      expect(hasRules).toBe(true)
    })
  })

  describe('Combined configuration', () => {
    it('should be combinable without conflicts', () => {
      const combined = [...mainConfig, ...typescriptConfig]
      expect(Array.isArray(combined)).toBe(true)
      expect(combined.length).toBe(mainConfig.length + typescriptConfig.length)
    })
  })
})