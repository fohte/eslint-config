import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { mainConfig, typescriptConfig } from '../../index.js'

describe('TypeScript Rules Behavior', () => {
  const eslint = new ESLint({
    overrideConfig: [...mainConfig, ...typescriptConfig] as ESLint.Options['overrideConfig'],
  })

  describe('@typescript-eslint/no-explicit-any', () => {
    it('should detect explicit any type', async () => {
      const code = `
function processData(data: any): any {
  return data
}
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === '@typescript-eslint/no-explicit-any')).toHaveLength(2)
    })

    it('should suggest using unknown instead of any', async () => {
      const code = `
function handleUnknownData(data: any) {
  console.log(data)
}
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      const anyError = results[0].messages.find(e => e.ruleId === '@typescript-eslint/no-explicit-any')
      
      expect(anyError).toBeDefined()
      expect(anyError?.message).toContain('any')
    })
  })

  describe('@typescript-eslint/no-unused-vars vs no-unused-vars', () => {
    it('should not report unused variables (rule is off)', async () => {
      const code = `
export function test() {
  const unused = 'this is unused'
  const alsoUnused: string = 'also unused'
  return 'test'
}
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      const errors = results[0].messages
      
      // Both no-unused-vars and @typescript-eslint/no-unused-vars should be off
      expect(errors.filter(e => 
        e.ruleId === 'no-unused-vars' || 
        e.ruleId === '@typescript-eslint/no-unused-vars'
      )).toHaveLength(0)
    })
  })

  describe('Type imports handling', () => {
    it('should handle type imports correctly', async () => {
      const code = `
import type { Config } from './types'
import { helper } from './helper'
import React from 'react'

export function useConfig(config: Config) {
  return helper(config)
}
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      const importErrors = results[0].messages.filter(e => e.ruleId?.includes('import'))
      
      // Type imports should be handled properly by the sort rules
      expect(importErrors.some(e => e.ruleId === 'simple-import-sort/imports')).toBe(true)
    })
  })

  describe('TypeScript-specific syntax', () => {
    it('should parse interfaces correctly', async () => {
      const code = `
interface User {
  id: number
  name: string
  email?: string
}

export const createUser = (data: Partial<User>): User => {
  return { id: 1, name: 'test', ...data }
}
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      
      // Should not have parsing errors
      expect(results[0].messages.filter(e => e.fatal)).toHaveLength(0)
    })

    it('should parse enums correctly', async () => {
      const code = `
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

export function getStatus(): Status {
  return Status.Active
}
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      
      expect(results[0].messages.filter(e => e.fatal)).toHaveLength(0)
    })

    it('should parse generic types correctly', async () => {
      const code = `
export function identity<T>(value: T): T {
  return value
}

export const numberIdentity = identity<number>(42)
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      
      expect(results[0].messages.filter(e => e.fatal)).toHaveLength(0)
    })
  })

  describe('TypeScript with JSX (.tsx files)', () => {
    it('should parse TSX syntax correctly', async () => {
      const code = `
import React from 'react'

interface Props {
  name: string
  age?: number
}

export const Component: React.FC<Props> = ({ name, age }) => {
  return <div>Hello {name}, age: {age || 'unknown'}</div>
}
`
      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      
      expect(results[0].messages.filter(e => e.fatal)).toHaveLength(0)
    })
  })

  describe('@typescript-eslint recommended rules', () => {
    it('should enforce other TypeScript best practices', async () => {
      const code = `
// This should trigger @typescript-eslint/no-inferrable-types
const myString: string = 'hello'
const myNumber: number = 42

export { myString, myNumber }
`
      const results = await eslint.lintText(code, { filePath: 'test.ts' })
      const errors = results[0].messages
      
      // The recommended config includes various rules
      expect(errors.some(e => e.ruleId?.startsWith('@typescript-eslint/'))).toBe(true)
    })
  })
})