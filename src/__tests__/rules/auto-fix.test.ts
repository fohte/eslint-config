import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { mainConfig, typescriptConfig } from '../../index.js'

describe('Auto-fix Behavior', () => {
  describe('JavaScript auto-fix', () => {
    // Merge flat config array into a single config object for ESLint 8.x
    const mergedConfig = mainConfig.reduce((acc, config) => ({
      ...acc,
      ...config,
      plugins: { ...acc.plugins, ...config.plugins },
      rules: { ...acc.rules, ...config.rules },
    }), {} as any)

    const eslint = new ESLint({
      overrideConfig: mergedConfig,
      fix: true,
    })

    it('should fix import order automatically', async () => {
      const code = `
import { z } from 'zod'
import axios from 'axios'
import React from 'react'
import { helper } from './utils/helper'
import { api } from './api'
import path from 'path'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()

      // Verify the order: node builtins, external packages, then local imports
      const lines = fixed!.split('\n').filter(line => line.trim())
      const importLines = lines.filter(line => line.startsWith('import'))

      // path (node builtin) should come first
      expect(importLines[0]).toContain('path')

      // External packages (alphabetical)
      expect(importLines[1]).toContain('axios')
      expect(importLines[2]).toContain('React')
      expect(importLines[3]).toContain('zod')

      // Local imports should be last
      expect(importLines[4]).toContain('./api')
      expect(importLines[5]).toContain('./utils/helper')
    })

    it('should add newline after imports automatically', async () => {
      const code = `
import React from 'react'
const data = 'test'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()
      expect(fixed).toMatch(/import React from 'react'\n\nconst data = 'test'/)
    })

    it('should combine duplicate imports', async () => {
      const code = `
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

const Component = () => {
  return null
}
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()
      expect(fixed).toContain('import React, { useEffect, useState } from \'react\'')
      expect((fixed!.match(/from 'react'/g) || []).length).toBe(1)
    })

    it('should fix export order', async () => {
      const code = `
export { z } from './z'
export { a } from './a'
export { b } from './b'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()
      const exportLines = fixed!.split('\n').filter(line => line.includes('export'))
      expect(exportLines[0]).toContain('./a')
      expect(exportLines[1]).toContain('./b')
      expect(exportLines[2]).toContain('./z')
    })

    it('should handle complex import scenarios', async () => {
      const code = `
import { helper } from './helper'
import type { Config } from './types'
import React, { useState } from 'react'
import * as path from 'path'
import { z } from 'zod'
import axios from 'axios'
const data = {}
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()
      // Should have newline after imports
      expect(fixed).toContain('\n\nconst data')
      // Imports should be sorted
      expect(fixed!.indexOf('path')).toBeLessThan(fixed!.indexOf('axios'))
      expect(fixed!.indexOf('axios')).toBeLessThan(fixed!.indexOf('React'))
    })
  })

  describe('TypeScript auto-fix', () => {
    // Merge flat config arrays into a single config object for ESLint 8.x
    const mergedConfig = [...mainConfig, ...typescriptConfig].reduce((acc, config) => ({
      ...acc,
      ...config,
      plugins: { ...acc.plugins, ...config.plugins },
      rules: { ...acc.rules, ...config.rules },
      languageOptions: config.languageOptions ? {
        ...acc.languageOptions,
        ...config.languageOptions,
        parser: config.languageOptions.parser || acc.languageOptions?.parser,
      } : acc.languageOptions,
    }), {} as any)

    const eslint = new ESLint({
      overrideConfig: mergedConfig,
      fix: true,
    })

    it('should handle type imports correctly', async () => {
      const code = `
import { helper } from './helper'
import type { Config } from './types'
import React from 'react'
import type { User } from './user'

export function test(config: Config, user: User) {
  return helper({ config, user })
}
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()
      // External imports should come before local imports
      expect(fixed!.indexOf('React')).toBeLessThan(fixed!.indexOf('./helper'))
    })

    it('should not break TypeScript syntax when fixing', async () => {
      const code = `
import { z } from 'zod'
import axios from 'axios'
interface User {
  name: string
}
const data: User = { name: 'test' }
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()
      // Should maintain the interface declaration
      expect(fixed).toContain('interface User')
      // Should maintain type annotation
      expect(fixed).toContain('const data: User')
      // Should have proper newline after imports
      expect(fixed).toMatch(/from 'zod'\n\ninterface/)
    })
  })

  describe('Fix all issues in a file', () => {
    // Merge flat config array into a single config object for ESLint 8.x
    const mergedConfig = mainConfig.reduce((acc, config) => ({
      ...acc,
      ...config,
      plugins: { ...acc.plugins, ...config.plugins },
      rules: { ...acc.rules, ...config.rules },
    }), {} as any)

    const eslint = new ESLint({
      overrideConfig: mergedConfig,
      fix: true,
    })

    it('should fix all auto-fixable issues at once', async () => {
      const code = `
const x = 1
import { z } from 'zod'
import React from 'react'
import { useState } from 'react'
import { api } from './api'
const y = 2
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const fixed = results[0].output

      expect(fixed).toBeDefined()

      // All imports should be at the top
      const lines = fixed!.split('\n').filter(line => line.trim())
      expect(lines[0]).toContain('import')

      // Imports should be combined and sorted
      expect(fixed).toContain('import React, { useState }')

      // Should have newline after imports
      expect(fixed).toMatch(/from ['"]\.\/api['"]\n\nconst x = 1/)

      // Non-import code should maintain order
      expect(fixed!.indexOf('const x = 1')).toBeLessThan(fixed!.indexOf('const y = 2'))
    })
  })
})
