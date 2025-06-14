import { describe, expect,it } from 'vitest'

import {
  runESLint,
  withTestProject} from './helpers/e2e-test-helper.js'

describe('Prettier Compatibility E2E', { timeout: 30000 }, () => {
  it('allows Prettier-compatible formatting', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `const longArray = [
  'first item',
  'second item',
  'third item',
  'fourth item',
  'fifth item'
]

const obj = {
  key1: 'value1',
  key2: 'value2',
  key3: 'value3'
}

function longFunction(
  param1,
  param2,
  param3,
  param4
) {
  return param1 + param2 + param3 + param4
}
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)

      // Should not have formatting-related errors since Prettier is disabled
      const formattingRules = [
        'indent',
        'quotes',
        'semi',
        'comma-dangle',
        'max-len',
        'object-curly-spacing',
        'array-bracket-spacing'
      ]

      const messages = output.flatMap(r => r.messages)
      const formattingErrors = messages.filter(m =>
        m.ruleId && formattingRules.includes(m.ruleId)
      )

      expect(formattingErrors).toHaveLength(0)
    })
  })

  it('does not conflict with trailing commas', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `const obj = {
  a: 1,
  b: 2,
}

const arr = [
  1,
  2,
  3,
]

function fn(
  x,
  y,
) {
  return x + y
}
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)

      // Should not report errors for trailing commas
      const messages = output.flatMap(r => r.messages)
      const commaErrors = messages.filter(m =>
        m.ruleId === 'comma-dangle'
      )

      expect(commaErrors).toHaveLength(0)
    })
  })

  it('does not conflict with arrow function parentheses', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `// Both styles should be allowed
const fn1 = x => x * 2
const fn2 = (x) => x * 2
const fn3 = (x, y) => x + y
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)

      const messages = output.flatMap(r => r.messages)
      const arrowParenErrors = messages.filter(m =>
        m.ruleId === 'arrow-parens'
      )

      expect(arrowParenErrors).toHaveLength(0)
    })
  })

  it('does not conflict with quote styles', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `const single = 'single quotes'
const double = "double quotes"
const template = \`template literal\`
const mixed = "it's okay"
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)

      const messages = output.flatMap(r => r.messages)
      const quoteErrors = messages.filter(m =>
        m.ruleId === 'quotes'
      )

      expect(quoteErrors).toHaveLength(0)
    })
  })

  it('does not enforce semicolons', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `const a = 1
const b = 2;

function fn() {
  return 42
}

class MyClass {
  method() {
    console.log('hello')
  }
}
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)

      const messages = output.flatMap(r => r.messages)
      const semiErrors = messages.filter(m =>
        m.ruleId === 'semi'
      )

      expect(semiErrors).toHaveLength(0)
    })
  })

  it('allows various indentation styles', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `function example() {
  if (true) {
    console.log('2 spaces')
  }

    const obj = {
      key: 'value',
      nested: {
        deep: true
      }
    }

  return obj
}
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)

      const messages = output.flatMap(r => r.messages)
      const indentErrors = messages.filter(m =>
        m.ruleId === 'indent' || m.ruleId === '@typescript-eslint/indent'
      )

      expect(indentErrors).toHaveLength(0)
    })
  })
})
