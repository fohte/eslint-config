import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { mainConfig } from '../../index.js'

describe('Import Rules Behavior', () => {
  const eslint = new ESLint({
    overrideConfig: mainConfig as ESLint.Options['overrideConfig'],
  })

  describe('simple-import-sort/imports', () => {
    it('should detect unordered imports', async () => {
      const code = `
import { z } from 'zod'
import { a } from './a'
import React from 'react'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.some(e => e.ruleId === 'simple-import-sort/imports')).toBe(true)
    })

    it('should pass with correctly ordered imports', async () => {
      const code = `
import React from 'react'
import { z } from 'zod'

import { a } from './a'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'simple-import-sort/imports')).toHaveLength(0)
    })

    it('should group imports correctly', async () => {
      // Test that imports are grouped: external packages, then internal imports
      const code = `
import path from 'path'
import React from 'react'
import { useState } from 'react'

import { LOCAL_CONSTANT } from './constants'
import { helper } from './utils/helper'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'simple-import-sort/imports')).toHaveLength(0)
    })
  })

  describe('import/first', () => {
    it('should error when imports are not first', async () => {
      const code = `
const someVar = 'test'
import React from 'react'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.some(e => e.ruleId === 'import/first')).toBe(true)
    })
  })

  describe('import/newline-after-import', () => {
    it('should require newline after imports', async () => {
      const code = `
import React from 'react'
const data = 'test'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.some(e => e.ruleId === 'import/newline-after-import')).toBe(true)
    })

    it('should pass with newline after imports', async () => {
      const code = `
import React from 'react'

const data = 'test'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'import/newline-after-import')).toHaveLength(0)
    })
  })

  describe('import/no-duplicates', () => {
    it('should detect duplicate imports', async () => {
      const code = `
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.some(e => e.ruleId === 'import/no-duplicates')).toBe(true)
    })

    it('should pass with combined imports', async () => {
      const code = `
import React, { useState, useEffect } from 'react'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'import/no-duplicates')).toHaveLength(0)
    })
  })

  describe('simple-import-sort/exports', () => {
    it('should detect unordered exports', async () => {
      const code = `
export { z } from './z'
export { a } from './a'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.some(e => e.ruleId === 'simple-import-sort/exports')).toBe(true)
    })
  })

  describe('Auto-fix behavior', () => {
    it('should fix import order automatically', async () => {
      const eslintWithFix = new ESLint({
        overrideConfig: mainConfig as ESLint.Options['overrideConfig'],
        fix: true,
      })
      
      const code = `
import { z } from 'zod'
import { a } from './a'
import React from 'react'
`
      const results = await eslintWithFix.lintText(code, { filePath: 'test.js' })
      const fixedCode = results[0].output
      
      expect(fixedCode).toBeDefined()
      // React should come before zod (alphabetical)
      expect(fixedCode!.indexOf('import React')).toBeLessThan(fixedCode!.indexOf('import { z }'))
      // External imports should come before local imports
      expect(fixedCode!.indexOf('import { z }')).toBeLessThan(fixedCode!.indexOf('./a'))
    })

    it('should combine duplicate imports automatically', async () => {
      const eslintWithFix = new ESLint({
        overrideConfig: mainConfig as ESLint.Options['overrideConfig'],
        fix: true,
      })
      
      const code = `
import React from 'react'
import { useState } from 'react'
`
      const results = await eslintWithFix.lintText(code, { filePath: 'test.js' })
      const fixedCode = results[0].output
      
      expect(fixedCode).toContain('import React, { useState } from \'react\'')
      expect(fixedCode).not.toMatch(/import.*react.*\n.*import.*react/)
    })
  })
})