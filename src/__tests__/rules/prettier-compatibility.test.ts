import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { mainConfig } from '../../index.js'

describe('Prettier Compatibility', () => {
  const eslint = new ESLint({
    overrideConfig: mainConfig as ESLint.Options['overrideConfig'],
  })

  describe('Formatting rules should be disabled', () => {
    it('should not complain about object spacing', async () => {
      const code = `
const obj={a:1,b:2,c:3}
const obj2 = { a: 1, b: 2, c: 3 }
const obj3 = {a:1,  b:2,    c:3}
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      // Should not have any spacing-related errors
      expect(errors.filter(e => 
        e.ruleId?.includes('space') || 
        e.ruleId?.includes('object-curly')
      )).toHaveLength(0)
    })

    it('should not complain about array spacing', async () => {
      const code = `
const arr=[1,2,3,4,5]
const arr2 = [ 1, 2, 3, 4, 5 ]
const arr3 = [1,  2,   3,    4,     5]
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => 
        e.ruleId?.includes('array') || 
        e.ruleId?.includes('bracket')
      )).toHaveLength(0)
    })

    it('should not enforce quotes style', async () => {
      const code = `
const single = 'single quotes'
const double = "double quotes"
const template = \`template literal\`
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'quotes')).toHaveLength(0)
    })

    it('should not enforce semicolon usage', async () => {
      const code = `
const withSemi = true;
const withoutSemi = false
function test() { return 'test' }
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'semi')).toHaveLength(0)
    })

    it('should not enforce indentation', async () => {
      const code = `
function test() {
return true
    }

  function test2() {
        return false
}
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'indent')).toHaveLength(0)
    })

    it('should not enforce trailing commas', async () => {
      const code = `
const obj1 = {
  a: 1,
  b: 2,
  c: 3,
}

const obj2 = {
  a: 1,
  b: 2,
  c: 3
}

const arr1 = [
  1,
  2,
  3,
]

const arr2 = [
  1,
  2,
  3
]
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'comma-dangle')).toHaveLength(0)
    })

    it('should not enforce line length (max-len)', async () => {
      const code = `
const veryLongLine = 'this is a very long line that would normally trigger max-len rule but should be handled by prettier instead so eslint should not complain about it'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'max-len')).toHaveLength(0)
    })

    it('should not enforce function parentheses spacing', async () => {
      const code = `
function test( a, b ) {
  return a + b
}

const arrow = (a,b)=>a+b
const arrow2 = ( a, b ) => a + b
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => 
        e.ruleId?.includes('paren') || 
        e.ruleId?.includes('arrow-spacing')
      )).toHaveLength(0)
    })

    it('should not enforce operator spacing', async () => {
      const code = `
const a=1+2
const b = 3 + 4
const c = 5+6
const d=7    +    8
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      expect(errors.filter(e => e.ruleId === 'space-infix-ops')).toHaveLength(0)
    })
  })

  describe('Non-formatting rules should still work', () => {
    it('should still detect import order issues', async () => {
      const code = `
import { z } from 'zod'
import { a } from './a'
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      // Import rules should still work
      expect(errors.some(e => e.ruleId === 'simple-import-sort/imports')).toBe(true)
    })

    it('should not complain about unused variables', async () => {
      const code = `
const unused = 'test'
const alsoUnused = 42
`
      const results = await eslint.lintText(code, { filePath: 'test.js' })
      const errors = results[0].messages
      
      // no-unused-vars is turned off in our config
      expect(errors.filter(e => e.ruleId === 'no-unused-vars')).toHaveLength(0)
    })
  })
})