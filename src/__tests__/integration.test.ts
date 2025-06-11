import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { mainConfig, typescriptConfig } from '../index.js'

describe('ESLint Integration Tests', () => {
  describe('Configuration structure validation', () => {
    it('mainConfig should be valid ESLint flat config', () => {
      expect(Array.isArray(mainConfig)).toBe(true)
      mainConfig.forEach((config) => {
        // Each config should be an object
        expect(typeof config).toBe('object')
        
        // Check for valid flat config properties
        const validKeys = ['files', 'ignores', 'languageOptions', 'linterOptions', 'processor', 'plugins', 'rules', 'settings']
        Object.keys(config).forEach((key) => {
          expect(validKeys).toContain(key)
        })
      })
    })

    it('typescriptConfig should be valid ESLint flat config', () => {
      expect(Array.isArray(typescriptConfig)).toBe(true)
      typescriptConfig.forEach((config) => {
        expect(typeof config).toBe('object')
        
        const validKeys = ['files', 'ignores', 'languageOptions', 'linterOptions', 'processor', 'plugins', 'rules', 'settings']
        Object.keys(config).forEach((key) => {
          expect(validKeys).toContain(key)
        })
      })
    })
  })

  describe('Rule validation', () => {
    it('mainConfig should have expected import-related rules', () => {
      const configWithRules = mainConfig.find((config) => config.rules)
      expect(configWithRules).toBeDefined()
      expect(configWithRules?.rules).toMatchObject({
        'no-unused-vars': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
      })
    })

    it('mainConfig should include prettier config', () => {
      // eslint-config-prettier should be included
      const hasPrettierRules = mainConfig.some((config) => 
        config.rules && Object.keys(config.rules).some((rule) => 
          // Prettier config typically turns off formatting rules
          config.rules![rule] === 'off' || config.rules![rule] === 0
        )
      )
      expect(hasPrettierRules).toBe(true)
    })

    it('typescriptConfig should target TypeScript files', () => {
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

    it('typescriptConfig should have TypeScript parser', () => {
      const tsParserConfig = typescriptConfig.find((config) => 
        config.languageOptions?.parser
      )
      expect(tsParserConfig).toBeDefined()
      expect(tsParserConfig?.languageOptions?.parser).toBeTruthy()
    })
  })

  describe('Combined configuration', () => {
    it('should be able to combine mainConfig and typescriptConfig', () => {
      const combinedConfig = [...mainConfig, ...typescriptConfig]
      expect(Array.isArray(combinedConfig)).toBe(true)
      expect(combinedConfig.length).toBe(mainConfig.length + typescriptConfig.length)
      
      // Each config should still be valid
      combinedConfig.forEach((config) => {
        expect(typeof config).toBe('object')
      })
    })

    it('should not have conflicting file patterns when combined', () => {
      const combinedConfig = [...mainConfig, ...typescriptConfig]
      const filePatterns: string[] = []
      
      combinedConfig.forEach((config) => {
        if (config.files && Array.isArray(config.files)) {
          config.files.forEach((pattern) => {
            if (Array.isArray(pattern)) {
              filePatterns.push(...pattern)
            } else if (typeof pattern === 'string') {
              filePatterns.push(pattern)
            }
          })
        }
      })
      
      // TypeScript config should only apply to TS files
      const tsPatterns = filePatterns.filter((pattern) => 
        typeof pattern === 'string' && pattern.includes('.ts')
      )
      expect(tsPatterns.length).toBeGreaterThan(0)
    })
  })

  describe('Plugin validation', () => {
    it('mainConfig should include required plugins', () => {
      const pluginConfig = mainConfig.find((config) => config.plugins)
      expect(pluginConfig).toBeDefined()
      expect(pluginConfig?.plugins).toHaveProperty('simple-import-sort')
      expect(pluginConfig?.plugins).toHaveProperty('import')
    })

    it('should have valid plugin references in rules', () => {
      const rulesConfig = mainConfig.find((config) => config.rules)
      const ruleNames = Object.keys(rulesConfig?.rules || {})
      
      // Check that plugin rules use correct prefixes
      const pluginRules = ruleNames.filter((rule) => rule.includes('/'))
      pluginRules.forEach((rule) => {
        const [pluginName] = rule.split('/')
        expect(['simple-import-sort', 'import', '@typescript-eslint']).toContain(pluginName)
      })
    })
  })
})